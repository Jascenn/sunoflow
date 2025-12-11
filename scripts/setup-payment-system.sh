#!/bin/bash

# SunoFlow 支付系统一键部署脚本
# 运行: bash scripts/setup-payment-system.sh

set -e

echo "🚀 开始部署 SunoFlow 支付系统..."

PROJECT_DIR="/Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow"
cd "$PROJECT_DIR"

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p app/api/payment/{create-checkout,webhook}
mkdir -p app/payment/{success,cancel}

# 创建 create-checkout API
echo "✍️  创建支付会话 API..."
cat > app/api/payment/create-checkout/route.ts << 'EOF'
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPlanById } from '@/lib/pricing';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay', 'wechat_pay'],
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: plan.name,
              description: `${plan.credits} 积分${plan.bonus ? ` + ${plan.bonus} 赠送` : ''}`,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
        credits: plan.credits.toString(),
        bonus: (plan.bonus || 0).toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
EOF

# 创建 webhook API
echo "✍️  创建 Webhook API..."
cat > app/api/payment/webhook/route.ts << 'EOF'
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0');
    const bonus = parseInt(session.metadata?.bonus || '0');
    const totalCredits = credits + bonus;

    if (!userId) {
      console.error('No userId in session metadata');
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    console.log(`[PAYMENT] Processing payment for user ${userId}, credits ${totalCredits}`);

    try {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.upsert({
          where: { userId },
          update: {
            balance: { increment: totalCredits },
            updatedAt: new Date(),
          },
          create: {
            id: `wallet_${userId}_${Date.now()}`,
            userId,
            balance: totalCredits,
            updatedAt: new Date(),
          },
        });

        await tx.transaction.create({
          data: {
            id: `txn_${Date.now()}_${userId}`,
            userId,
            amount: totalCredits,
            type: 'RECHARGE',
            description: `充值成功 - Stripe`,
            referenceId: session.id,
            createdAt: new Date(),
          },
        });

        console.log(`[PAYMENT] Success: ${totalCredits} credits added, new balance: ${wallet.balance}`);
      });

      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error('[PAYMENT] Transaction failed:', error);
      return NextResponse.json(
        { error: 'Failed to process payment', details: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
EOF

# 创建支付成功页面
echo "✍️  创建支付成功页面..."
cat > app/payment/success/page.tsx << 'EOF'
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">支付成功！</h1>
        <p className="text-gray-600 mb-8">您的积分已充值到账，感谢您的支持！</p>
        <div className="space-y-3">
          <Link href="/dashboard">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2">
              <span>返回控制台</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          {sessionId && (
            <p className="text-sm text-gray-500">订单号: {sessionId.slice(0, 20)}...</p>
          )}
          <p className="text-sm text-gray-400">5秒后自动跳转...</p>
        </div>
      </div>
    </div>
  );
}
EOF

# 创建支付取消页面
echo "✍️  创建支付取消页面..."
cat > app/payment/cancel/page.tsx << 'EOF'
'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">支付已取消</h1>
        <p className="text-gray-600 mb-8">您已取消本次支付，没有扣除任何费用。</p>
        <div className="space-y-3">
          <Link href="/recharge">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>重新选择套餐</span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition">
              返回控制台
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ 支付系统文件创建完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 更新 .env.local 添加 Stripe 配置:"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   NEXT_PUBLIC_APP_URL=http://localhost:3000"
echo ""
echo "2. 注册 Stripe 账户: https://dashboard.stripe.com/register"
echo "3. 获取测试 API Keys"
echo "4. 配置 Webhook: https://dashboard.stripe.com/test/webhooks"
echo ""
echo "🎉 完成！现在可以测试支付功能了！"
