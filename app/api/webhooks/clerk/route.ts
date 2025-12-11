import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserAvatarUrl } from '@/lib/avatar';

export const runtime = 'edge';

/**
 * Clerk Webhook Handler
 * Automatically creates User and Wallet when a new user signs up
 *
 * 头像策略:
 * - OAuth 登录（Google, GitHub等）: 使用第三方提供的头像
 * - 邮箱注册: 使用 DiceBear 生成个性化头像
 *
 * Setup in Clerk Dashboard:
 * 1. Go to Webhooks
 * 2. Add Endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Handle user.created event
    if (type === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = data;

      const primaryEmail = email_addresses.find((e: any) => e.id === data.primary_email_address_id);

      if (!primaryEmail?.email_address) {
        return NextResponse.json(
          { error: 'No email found' },
          { status: 400 }
        );
      }

      // 智能头像处理:
      // - OAuth 登录且有头像 → 使用原头像
      // - 邮箱注册或无头像 → 使用 DiceBear 生成
      const avatarUrl = getUserAvatarUrl(image_url, primaryEmail.email_address);

      // Create user and wallet in a transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkId,
            email: primaryEmail.email_address,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl,  // 使用智能头像
          },
        });

        // Create wallet with initial balance (e.g., 100 free credits)
        await tx.wallet.create({
          data: {
            userId: user.id,
            balance: 100, // Initial free credits
            version: 0,
          },
        });

        // Create initial transaction record
        await tx.transaction.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            amount: 100,
            type: 'RECHARGE',
            description: 'Welcome bonus - Free credits',
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'User and wallet created',
      });
    }

    // Handle other events if needed
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed',
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
