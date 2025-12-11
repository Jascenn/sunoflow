import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSunoClient } from '@/lib/suno-client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Auth Check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all tasks for this user
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 tasks
    });

    // Find tasks that need status update (PENDING, PROCESSING, or COMPLETED without audioUrl)
    const pendingTasks = tasks.filter(
      task =>
        task.status === 'PENDING' ||
        task.status === 'PROCESSING' ||
        (task.status === 'COMPLETED' && !task.audioUrl) // Re-check completed tasks without audio
    );

    // If there are pending tasks, fetch their status from Suno
    if (pendingTasks.length > 0) {
      const sunoClient = getSunoClient();

      // Update each pending task individually and create additional tasks for 302.ai's multiple results
      const updatePromises = pendingTasks.map(async (task) => {
        if (!task.sunoTaskId) return null;

        try {
          const sunoStatus = await sunoClient.getStatus(task.sunoTaskId);

          // Check if sunoStatus is null or undefined
          if (!sunoStatus) {
            console.error(`Task ${task.id}: Suno API returned null status`);
            return null;
          }

          // 从 response 中提取音乐数据 (302.ai 可能返回多个结果)
          const musicData = sunoStatus.response?.sunoData || [];

          // Map status to our database status
          // Only mark as COMPLETED if we actually have audio data
          let dbStatus = 'PROCESSING';
          if (sunoStatus.status === 'SUCCESS' || sunoStatus.status === 'FIRST_SUCCESS') {
            // Check if we have actual audio URLs before marking as completed
            const hasAudioData = musicData.length > 0 && musicData.some(m => m.audioUrl || m.streamAudioUrl);
            dbStatus = hasAudioData ? 'COMPLETED' : 'PROCESSING';
          } else if (
            sunoStatus.status === 'CREATE_TASK_FAILED' ||
            sunoStatus.status === 'GENERATE_AUDIO_FAILED' ||
            sunoStatus.status === 'CALLBACK_EXCEPTION' ||
            sunoStatus.status === 'SENSITIVE_WORD_ERROR'
          ) {
            dbStatus = 'FAILED';
          } else if (sunoStatus.status === 'TEXT_SUCCESS') {
            dbStatus = 'PROCESSING';
          } else if (sunoStatus.status === 'PENDING') {
            dbStatus = 'PENDING';
          }

          // 如果任务从非FAILED状态变为FAILED,执行退款并更新状态
          const wasNotFailed = task.status !== 'FAILED';
          const isNowFailed = dbStatus === 'FAILED';

          if (wasNotFailed && isNowFailed) {
            console.log(`[TASKS] Task ${task.id} failed, refunding 5 credits to user ${task.userId}`);

            try {
              // 使用事务执行原子操作: 退款 + 更新状态
              return await prisma.$transaction(async (tx) => {
                // 1. 更新钱包余额
                await tx.wallet.update({
                  where: { userId: task.userId },
                  data: {
                    balance: { increment: 5 },
                    version: { increment: 1 },
                    updatedAt: new Date(),
                  },
                });

                // 2. 记录退款交易
                await tx.transaction.create({
                  data: {
                    id: crypto.randomUUID(),
                    userId: task.userId,
                    amount: 5,
                    type: 'REFUND',
                    description: `任务失败退款 - ${task.title || task.prompt.slice(0, 50)}`,
                    referenceId: task.id, // 关键: 关联任务ID
                    createdAt: new Date(),
                  },
                });

                // 3. 更新任务状态
                const updatedTask = await tx.task.update({
                  where: { id: task.id },
                  data: {
                    status: 'FAILED',
                    progress: sunoStatus.progress || task.progress,
                    failReason: sunoStatus.failReason || 'Unknown error',
                    updatedAt: new Date(),
                  },
                });

                console.log(`[TASKS] Refund and update completed for task ${task.id}`);
                return updatedTask;
              });
            } catch (refundError) {
              console.error(`[TASKS] Failed to refund transaction for task ${task.id}:`, refundError);
              return null; // 让下次轮询重试
            }
          }

          // 如果只有一个结果或没有结果，更新当前任务 (非失败情况)
          if (musicData.length <= 1) {
            const firstMusic = musicData[0];
            return prisma.task.update({
              where: { id: task.id },
              data: {
                status: dbStatus,
                title: firstMusic?.title || task.title,
                audioUrl: firstMusic?.streamAudioUrl || firstMusic?.audioUrl || task.audioUrl,
                imageUrl: firstMusic?.imageUrl || task.imageUrl,
                duration: firstMusic?.duration || task.duration,
                tags: firstMusic?.tags || task.tags,
                progress: sunoStatus.progress || task.progress,
                failReason: sunoStatus.failReason || task.failReason,
                updatedAt: new Date(),
              },
            });
          }

          // 如果有多个结果（302.ai 通常返回 2 个），为每个创建/更新任务
          console.log(`[TASKS] Found ${musicData.length} results for task ${task.id}`);

          const updates = musicData.map(async (music: any, index: number) => {
            if (index === 0) {
              // 更新原始任务
              return prisma.task.update({
                where: { id: task.id },
                data: {
                  status: dbStatus,
                  title: music?.title || task.title,
                  audioUrl: music?.streamAudioUrl || music?.audioUrl,
                  imageUrl: music?.imageUrl,
                  duration: music?.duration,
                  tags: music?.tags,
                  progress: sunoStatus.progress || task.progress,
                  failReason: sunoStatus.failReason || task.failReason,
                  updatedAt: new Date(),
                },
              });
            } else {
              // 为额外的结果创建新任务（如果还不存在）
              const existingTask = await prisma.task.findFirst({
                where: {
                  userId: task.userId,
                  sunoTaskId: `${task.sunoTaskId}_${index + 1}`,
                },
              });

              if (existingTask) {
                // 更新现有的额外任务
                return prisma.task.update({
                  where: { id: existingTask.id },
                  data: {
                    status: dbStatus,
                    title: music?.title || task.title,
                    audioUrl: music?.streamAudioUrl || music?.audioUrl,
                    imageUrl: music?.imageUrl,
                    duration: music?.duration,
                    tags: music?.tags,
                    progress: sunoStatus.progress,
                    failReason: sunoStatus.failReason,
                    updatedAt: new Date(),
                  },
                });
              } else {
                // 创建新的额外任务
                console.log(`[TASKS] Creating additional task ${index + 1} for ${task.id}`);
                return prisma.task.create({
                  data: {
                    id: crypto.randomUUID(),
                    userId: task.userId,
                    sunoTaskId: `${task.sunoTaskId}_${index + 1}`,
                    prompt: task.prompt,
                    tags: music?.tags || task.tags,
                    model: task.model,
                    status: dbStatus,
                    title: music?.title || `${task.title} (${index + 1})`,
                    audioUrl: music?.streamAudioUrl || music?.audioUrl,
                    imageUrl: music?.imageUrl,
                    duration: music?.duration,
                    parentAudioId: task.id, // 关联到原始任务
                    createdAt: task.createdAt,
                    updatedAt: new Date(),
                  },
                });
              }
            }
          });

          return Promise.all(updates);
        } catch (error) {
          console.error(`Error updating task ${task.id}:`, error);
          // Continue even if one task fails
          return null;
        }
      });

      await Promise.all(updatePromises);
    }

    // Fetch updated tasks
    const updatedTasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      tasks: updatedTasks,
    });

  } catch (error: any) {
    console.error('Error in /api/tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tasks',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
