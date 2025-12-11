/**
 * 价格套餐配置
 * 支持 Stripe 和国内支付
 */

export interface PricingPlan {
  id: string;
  name: string;
  credits: number; // 积分数量
  price: number; // 价格（人民币）
  priceUSD: number; // 美元价格
  popular?: boolean; // 是否为热门套餐
  bonus?: number; // 赠送积分
  savings?: string; // 节省提示
  stripeProductId?: string; // Stripe Product ID
  stripePriceId?: string; // Stripe Price ID
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: '入门套餐',
    credits: 100,
    price: 19,
    priceUSD: 2.99,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_STARTER,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    id: 'basic',
    name: '基础套餐',
    credits: 300,
    price: 49,
    priceUSD: 6.99,
    bonus: 30,
    savings: '赠送 30 积分',
    popular: true,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_BASIC,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC,
  },
  {
    id: 'pro',
    name: '专业套餐',
    credits: 800,
    price: 99,
    priceUSD: 14.99,
    bonus: 100,
    savings: '赠送 100 积分',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PRO,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    id: 'enterprise',
    name: '企业套餐',
    credits: 2000,
    price: 199,
    priceUSD: 29.99,
    bonus: 300,
    savings: '赠送 300 积分',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ENTERPRISE,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
  },
];

/**
 * 根据套餐 ID 获取套餐详情
 */
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

/**
 * 计算总积分（包含赠送）
 */
export function getTotalCredits(plan: PricingPlan): number {
  return plan.credits + (plan.bonus || 0);
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  STRIPE = 'stripe',
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
}

/**
 * 支付方式配置
 */
export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string; // 图标名称或 emoji
  available: boolean; // 是否可用
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: PaymentMethod.STRIPE,
    name: '信用卡支付',
    description: '支持 Visa、Mastercard、American Express',
    icon: '💳',
    available: true,
  },
  {
    id: PaymentMethod.ALIPAY,
    name: '支付宝',
    description: '使用支付宝扫码支付',
    icon: '🔵',
    available: true,
  },
  {
    id: PaymentMethod.WECHAT,
    name: '微信支付',
    description: '使用微信扫码支付',
    icon: '🟢',
    available: true,
  },
];
