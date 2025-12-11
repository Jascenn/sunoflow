import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSunoClient } from '@/lib/suno-client';

export const runtime = 'edge';

/**
 * Sync tasks from Suno API to our database
 * This endpoint fetches all tasks from kie.ai and syncs them to our database
 */
export async function POST() {
  try {
    console.log('🔄 [SYNC] Starting task sync from Suno API');

    // 1. Auth Check
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

    console.log('👤 [SYNC] User:', user.email);

    // 2. Fetch tasks from Suno API
    const sunoClient = getSunoClient();
    const sunoTasks = await sunoClient.listTasks({ page: 1, pageSize: 50 });

    console.log(`📋 [SYNC] Found ${sunoTasks.length} tasks from Suno API`);

    // 3. Sync tasks to database
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const sunoTask of sunoTasks) {
      if (!sunoTask.taskId) {
        skippedCount++;
        continue;
      }

      try {
        // Check if task already exists
        const existingTask = await prisma.task.findUnique({
          where: { sunoTaskId: sunoTask.taskId },
        });

        // Map Suno API status to our database status
        let dbStatus = 'PROCESSING';
        if (sunoTask.status === 'SUCCESS' || sunoTask.status === 'FIRST_SUCCESS') {
          dbStatus = 'COMPLETED';
        } else if (
          sunoTask.status === 'CREATE_TASK_FAILED' ||
          sunoTask.status === 'GENERATE_AUDIO_FAILED' ||
          sunoTask.status === 'CALLBACK_EXCEPTION' ||
          sunoTask.status === 'SENSITIVE_WORD_ERROR'
        ) {
          dbStatus = 'FAILED';
        } else if (sunoTask.status === 'TEXT_SUCCESS') {
          dbStatus = 'PROCESSING';
        } else if (sunoTask.status === 'PENDING') {
          dbStatus = 'PENDING';
        }

        // Extract music data from response
        const firstMusic = sunoTask.response?.sunoData?.[0];

        if (existingTask) {
          // Update existing task
          await prisma.task.update({
            where: { id: existingTask.id },
            data: {
              status: dbStatus,
              title: firstMusic?.title || existingTask.title,
              audioUrl: firstMusic?.streamAudioUrl || firstMusic?.audioUrl || existingTask.audioUrl,
              imageUrl: firstMusic?.imageUrl || existingTask.imageUrl,
              duration: firstMusic?.duration || existingTask.duration,
              tags: firstMusic?.tags || existingTask.tags,
              updatedAt: new Date(),
            },
          });
          updatedCount++;
        } else {
          // Create new task
          await prisma.task.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              sunoTaskId: sunoTask.taskId,
              prompt: sunoTask.param || firstMusic?.gptDescriptionPrompt || 'No prompt',
              tags: firstMusic?.tags || null,
              model: firstMusic?.modelName || 'V3_5',
              status: dbStatus,
              title: firstMusic?.title || 'Untitled',
              audioUrl: firstMusic?.streamAudioUrl || firstMusic?.audioUrl || null,
              imageUrl: firstMusic?.imageUrl || null,
              duration: firstMusic?.duration || null,
              updatedAt: new Date(),
            },
          });
          createdCount++;
        }
      } catch (error: any) {
        console.error(`❌ [SYNC] Failed to sync task ${sunoTask.taskId}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`✅ [SYNC] Complete: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped`);

    return NextResponse.json({
      success: true,
      message: 'Tasks synced successfully',
      stats: {
        total: sunoTasks.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
      },
    });

  } catch (error: any) {
    console.error('❌ [SYNC] Error:', error);
    console.error('❌ [SYNC] Error stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Failed to sync tasks',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
