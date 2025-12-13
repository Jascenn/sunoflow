/**
 * Stripe 客户端配置
 * 用于服务端支付处理
 */

import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing. Payment features will not work.');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-11-17.clover' as any,
});
