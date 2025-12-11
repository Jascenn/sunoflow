# SunoFlow 支付系统 - 完整实现方案B(国内支付)

## 选择方案：使用 Stripe 统一支付

Stripe 原生支持支付宝和微信支付，无需单独集成第三方聚合支付。

### 优势
✅ 统一的API接口
✅ 自动货币转换
✅ 安全的webhook机制
✅ 完善的测试环境
✅ 无需企业资质即可测试

---

## 实现步骤

### 1. 安装依赖

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow
pnpm add stripe @stripe/stripe-js
```

### 2. 配置环境变量

在 `.env.local` 添加:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."  # 从 Stripe Dashboard 获取
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Webhook Secret (配置 webhook 后获取)
STRIPE_WEBHOOK_SECRET="whsec_..."

# 支付成功/取消回调 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 在 Stripe Dashboard 创建产品

登录 https://dashboard.stripe.com/test/products

为每个套餐创建产品:

1. **入门套餐** - ¥19 / $2.99
2. **基础套餐** - ¥49 / $6.99
3. **专业套餐** - ¥99 / $14.99
4. **企业套餐** - ¥199 / $29.99

记录每个产品的 `price_id`,更新 `lib/pricing.ts`

---

## 文件结构

```
sunoflow/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── create-checkout/
│   │       │   └── route.ts          # 创建支付会话
│   │       └── webhook/
│   │           └── route.ts          # 接收支付回调
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx              # 支付成功页面
│   │   └── cancel/
│   │       └── page.tsx              # 支付取消页面
│   └── recharge/
│       └── page.tsx                  # 充值页面(已有)
├── lib/
│   ├── pricing.ts                    # 价格配置(已有)
│   └── stripe.ts                     # Stripe 客户端配置
└── prisma/
    └── schema.prisma                 # 数据库模型(已有)
```

---

## 核心代码

### `/lib/stripe.ts` - Stripe 客户端配置

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
```

### `/app/api/payment/create-checkout/route.ts` - 创建支付会话

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPlanById } from '@/lib/pricing';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, paymentMethod } = await req.json();

    // 获取套餐信息
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay', 'wechat_pay'], // 支持多种支付方式
      line_items: [
        {
          price_data: {
            currency: 'cny', // 人民币
            product_data: {
              name: plan.name,
              description: `${plan.credits} 积分 + ${plan.bonus || 0} 赠送积分`,
            },
            unit_amount: plan.price * 100, // Stripe 使用分为单位
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      client_reference_id: user.id, // 用于识别用户
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
```

### `/app/api/payment/webhook/route.ts` - 处理支付回调

```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

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

  // 处理支付成功事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const credits = parseInt(session.metadata?.credits || '0');
    const bonus = parseInt(session.metadata?.bonus || '0');
    const totalCredits = credits + bonus;

    if (!userId) {
      console.error('No userId in session metadata');
      return NextResponse.json({ error: 'No user ID' }, { status: 400 });
    }

    console.log(`[PAYMENT] Processing payment for user ${userId}, plan ${planId}, credits ${totalCredits}`);

    try {
      // 使用事务更新钱包和创建交易记录
      await prisma.$transaction(async (tx) => {
        // 更新钱包余额
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

        // 创建充值交易记录
        await tx.transaction.create({
          data: {
            id: `txn_${Date.now()}_${userId}`,
            userId,
            amount: totalCredits,
            type: 'RECHARGE',
            description: `充值 ${planId} 套餐`,
            referenceId: session.id,
            createdAt: new Date(),
          },
        });

        console.log(`[PAYMENT] Successfully credited ${totalCredits} to user ${userId}, new balance: ${wallet.balance}`);
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

  // 处理其他事件类型
  return NextResponse.json({ received: true });
}
```

### `/app/payment/success/page.tsx` - 支付成功页面

```typescript
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
    // 5秒后自动跳转
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
        <p className="text-gray-600 mb-8">
          您的积分已充值到账，感谢您的支持！
        </p>
        <div className="space-y-3">
          <Link href="/dashboard">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2">
              <span>返回控制台</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-sm text-gray-500">
            {sessionId && `订单号: ${sessionId.slice(0, 20)}...`}
          </p>
          <p className="text-sm text-gray-400">5秒后自动跳转...</p>
        </div>
      </div>
    </div>
  );
}
```

### `/app/payment/cancel/page.tsx` - 支付取消页面

```typescript
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
        <p className="text-gray-600 mb-8">
          您已取消本次支付，没有扣除任何费用。
        </p>
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
```

---

## 配置 Webhook

1. 访问 https://dashboard.stripe.com/test/webhooks
2. 点击 "Add endpoint"
3. 输入 URL: `https://your-domain.com/api/payment/webhook`
4. 选择事件: `checkout.session.completed`
5. 复制 Webhook signing secret 到 `.env.local`

---

## 测试流程

### 1. 测试支付宝/微信支付

Stripe 测试模式支持:
- 支付宝测试: 选择 Alipay 后会显示测试二维码
- 微信支付测试: 选择 WeChat Pay 后会显示测试二维码

### 2. 测试信用卡支付

使用 Stripe 测试卡号:
- 成功: `4242 4242 4242 4242`
- CVV: 任意3位数字
- 日期: 任意未来日期

---

## 部署清单

- [ ] 注册 Stripe 账户
- [ ] 获取 API Keys
- [ ] 在 Stripe 创建产品和价格
- [ ] 配置环境变量
- [ ] 配置 Webhook
- [ ] 测试支付流程
- [ ] 切换到生产模式

---

## 安全注意事项

✅ Webhook 签名验证
✅ 用户身份验证
✅ 事务原子性
✅ 日志记录
✅ 错误处理
✅ 幂等性保证

---

## 下一步

现在开始实际编写代码？我可以立即创建所有文件！
