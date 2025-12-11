import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSunoClient } from '@/lib/suno-client';
import { SunoGenerateParams } from '@/lib/types/suno';
import { getMembershipStatus } from '@/lib/membership';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 [GENERATE] Starting music generation request');

    // 1. Auth Check
    const { userId } = await auth();
    console.log('🔐 [GENERATE] User ID:', userId);

    if (!userId) {
      console.error('❌ [GENERATE] Unauthorized - no userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Wallet: true },
    });

    console.log('👤 [GENERATE] User found:', {
      id: user?.id,
      email: user?.email,
      walletBalance: user?.Wallet?.balance,
    });

    if (!user) {
      console.error('❌ [GENERATE] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const params: SunoGenerateParams = await request.json();
    console.log('📝 [GENERATE] Request params:', JSON.stringify(params, null, 2));

    // 2. Validation
    const COST_PER_GENERATION = 5; // Example: 5 credits per generation

    // 2a. Validation - Check for concurrent limits
    const { features } = await getMembershipStatus(userId);
    const pendingTasksCount = await prisma.task.count({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    if (pendingTasksCount >= features.maxConcurrentGenerations) {
      console.error('❌ [GENERATE] Limit exceeded:', {
        pending: pendingTasksCount,
        max: features.maxConcurrentGenerations,
      });
      return NextResponse.json(
        {
          error: 'Generation limit reached',
          details: `Current plan limits to ${features.maxConcurrentGenerations} concurrent generation(s). Upgrade to PRO for more.`,
          code: 'LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // 2b. Validation - Check if user has enough credits
    if (!user.Wallet || user.Wallet.balance < COST_PER_GENERATION) {
      console.error('❌ [GENERATE] Insufficient credits:', {
        hasWallet: !!user.Wallet,
        balance: user.Wallet?.balance,
        required: COST_PER_GENERATION,
      });
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      );
    }

    console.log('✅ [GENERATE] Credit check passed, starting transaction');

    // 3. Transaction - Use Prisma transaction to ensure atomicity
    // Increase timeout to 60 seconds to account for slow Suno API responses
    const result = await prisma.$transaction(async (tx) => {
      console.log('💰 [GENERATE] Updating wallet balance');

      // a. Decrement wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { decrement: COST_PER_GENERATION },
          version: { increment: 1 }, // Optimistic locking
        },
      });

      console.log('💰 [GENERATE] Wallet updated:', {
        oldBalance: user.Wallet?.balance,
        newBalance: updatedWallet.balance,
      });

      // b. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          amount: -COST_PER_GENERATION,
          type: 'CONSUME',
          description: `Music generation: ${params.prompt.slice(0, 50)}...`,
        },
      });

      console.log('📝 [GENERATE] Transaction record created:', transaction.id);

      // c. Call Suno API
      console.log('🎵 [GENERATE] Calling Suno API with params:', JSON.stringify({
        prompt: params.prompt.slice(0, 100) + '...',
        model: params.model,
        customMode: params.customMode,
        instrumental: params.instrumental,
        style: params.style,
        title: params.title,
      }, null, 2));

      const sunoClient = getSunoClient();
      const taskId = await sunoClient.generate(params);

      console.log('✅ [GENERATE] Suno API returned taskId:', taskId);

      // d. Create Task record
      const task = await tx.task.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          sunoTaskId: taskId,
          prompt: params.prompt,
          tags: params.style || null,  // style 在新API中对应之前的 tags
          model: params.model || 'V3_5',  // 使用新的模型格式
          status: 'PENDING',
          title: params.title || null,
          updatedAt: new Date(),
        },
      });

      console.log('✅ [GENERATE] Task record created:', task.id);

      return {
        task,
        transaction,
        taskId,
        newBalance: updatedWallet.balance,
      };
    }, {
      timeout: 60000, // 60 seconds timeout for slow Suno API responses
    });

    console.log('🎉 [GENERATE] Generation successful:', {
      taskId: result.task.id,
      sunoTaskId: result.taskId,
      newBalance: result.newBalance,
    });

    return NextResponse.json({
      success: true,
      taskId: result.task.id,
      sunoTaskId: result.taskId,
      balance: result.newBalance,
    });

  } catch (error: any) {
    console.error('❌ [GENERATE] Error:', error);
    console.error('❌ [GENERATE] Error stack:', error.stack);
    console.error('❌ [GENERATE] Error details:', {
      message: error.message,
      name: error.name,
      response: error.response?.data,
    });

    // 4. Error Handling - Transaction will auto-rollback on error
    return NextResponse.json(
      {
        error: 'Failed to generate music',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
