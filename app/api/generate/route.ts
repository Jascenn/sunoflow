import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSunoClient } from '@/lib/suno-client';
import { SunoGenerateParams } from '@/lib/types/suno';
import { getMembershipStatus } from '@/lib/membership';
import { Prisma } from '@prisma/client';



import { getErrorMessage } from '@/lib/utils';

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

    // 3. Transaction Step 1: Deduct balance
    // We do this FIRST to ensure user has funds.
    const transactionId = crypto.randomUUID();
    let initialTransaction;

    try {
      initialTransaction = await prisma.$transaction(async (tx) => {
        // a. Decrement wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { userId: user.id },
          data: {
            balance: { decrement: COST_PER_GENERATION },
            version: { increment: 1 },
          },
        });

        if (updatedWallet.balance < 0) {
          throw new Error('Insufficient balance (race condition)');
        }

        // b. Create transaction record
        return await tx.transaction.create({
          data: {
            id: transactionId,
            userId: user.id,
            amount: -COST_PER_GENERATION,
            type: 'CONSUME',
            description: `Music generation: ${params.prompt.slice(0, 50)}...`,
          },
        });
      });

      console.log('💰 [GENERATE] Balance deducted, transaction:', transactionId);
    } catch (err: unknown) {
      console.error('❌ [GENERATE] Failed to deduct balance:', err);
      return NextResponse.json(
        { error: 'Transaction failed', details: getErrorMessage(err) },
        { status: 500 }
      );
    }

    // 4. External API Call (Outside Transaction)
    let taskId: string;
    try {
      console.log('🎵 [GENERATE] Calling Suno API...');
      const sunoClient = getSunoClient();
      // This can take up to 60s, so we MUST NOT hold a DB lock
      taskId = await sunoClient.generate(params);
      console.log('✅ [GENERATE] Suno API success, taskId:', taskId);
    } catch (apiError: unknown) {
      console.error('❌ [GENERATE] Suno API failed, refunding...', apiError);

      // 5. Refund on Failure
      try {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId: user.id },
            data: {
              balance: { increment: COST_PER_GENERATION },
              version: { increment: 1 }
            },
          });

          await tx.transaction.create({
            data: {
              userId: user.id,
              amount: COST_PER_GENERATION,
              type: 'REFUND',
              referenceId: transactionId,
              description: `Refund for failed generation: ${getErrorMessage(apiError).slice(0, 50)}`,
            },
          });
        });
        console.log('💰 [GENERATE] Refund successful');
      } catch (refundError) {
        console.error('🔥 [GENERATE] CRITICAL: Refund failed!', refundError);
        // In production, you would send this to Sentry/PagerDuty
      }

      return NextResponse.json(
        { error: 'Generation failed', details: getErrorMessage(apiError) },
        { status: 500 }
      );
    }

    // 6. Record Success (Create Task)
    try {
      const task = await prisma.task.create({
        data: {
          userId: user.id,
          sunoTaskId: taskId,
          prompt: params.prompt,
          tags: params.style || null,
          model: params.model || 'V3_5',
          status: 'PENDING',
          title: params.title || null,
        },
      });

      console.log('✅ [GENERATE] Task created:', task.id);

      return NextResponse.json({
        success: true,
        taskId: task.id,
        sunoTaskId: taskId,
      });
    } catch (dbError: unknown) {
      // Only the local task record failed. Use Suno ID to track? 
      // For now, we return partial success or error. 
      // Ideally we might want to refund here too, or just log it.
      console.error('❌ [GENERATE] Failed to save task record:', dbError);
      return NextResponse.json({
        success: true,
        warning: 'Task created but not saved to DB',
        sunoTaskId: taskId
      });
    }



  } catch (error: unknown) {
    console.error('❌ [GENERATE] Error:', error);
    // console.error('❌ [GENERATE] Error stack:', error.stack); // Stack might not exist on unknown
    console.error('❌ [GENERATE] Error details:', getErrorMessage(error));

    // 4. Error Handling - Transaction will auto-rollback on error
    return NextResponse.json(
      {
        error: 'Failed to generate music',
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
