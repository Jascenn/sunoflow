# SunoFlow 支付系统集成指南

## 概述

本指南将帮助你完成 SunoFlow 的完整支付系统集成，支持：
1. **Stripe** - 国际信用卡支付
2. **支付宝 + 微信支付** - 国内主流支付方式

## 已完成的功能

### ✅ 基础架构
- [x] 价格配置系统 ([lib/pricing.ts](lib/pricing.ts))
- [x] 充值页面 UI 设计
- [x] 钱包余额显示
- [x] 积分扣费系统
- [x] 自动退款逻辑

### ✅ 数据库 Schema
```prisma
model Transaction {
  id          String   @id
  userId      String
  amount      Int
  type        String   // RECHARGE, DEDUCT, REFUND
  description String?
  referenceId String?  // 支付订单 ID
  createdAt   DateTime @default(now())
}

model Wallet {
  id        String   @id
  userId    String   @unique
  balance   Int      @default(0)
  version   Int      @default(0)
  updatedAt DateTime
}
```

## 待实现的功能

### 1. Stripe 支付集成 🔵

#### 步骤 1: 注册 Stripe 账户
1. 访问 https://stripe.com
2. 创建账户
3. 获取 API Keys:
   - Publishable Key (客户端)
   - Secret Key (服务端)

#### 步骤 2: 安装依赖
```bash
pnpm add stripe @stripe/stripe-js
```

#### 步骤 3: 配置环境变量 (.env.local)
```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Product IDs (需要在 Stripe Dashboard 创建)
NEXT_PUBLIC_STRIPE_PRODUCT_STARTER="prod_..."
NEXT_PUBLIC_STRIPE_PRICE_STARTER="price_..."
NEXT_PUBLIC_STRIPE_PRODUCT_BASIC="prod_..."
NEXT_PUBLIC_STRIPE_PRICE_BASIC="price_..."
NEXT_PUBLIC_STRIPE_PRODUCT_PRO="prod_..."
NEXT_PUBLIC_STRIPE_PRICE_PRO="price_..."
NEXT_PUBLIC_STRIPE_PRODUCT_ENTERPRISE="prod_..."
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE="price_..."

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### 步骤 4: 创建 Stripe Checkout API
文件: `/app/api/payment/stripe/create-checkout/route.ts`

主要功能:
- 验证用户登录状态
- 验证套餐 ID
- 创建 Stripe Checkout Session
- 设置成功/取消回调 URL
- 返回 Checkout URL 给前端

#### 步骤 5: 创建 Stripe Webhook
文件: `/app/api/payment/stripe/webhook/route.ts`

监听事件:
- `checkout.session.completed` - 支付成功
- `charge.refunded` - 退款

处理逻辑:
- 验证 Webhook 签名
- 提取订单信息
- 更新用户钱包余额
- 创建交易记录

#### 步骤 6: 创建成功/取消页面
- `/app/payment/success/page.tsx` - 支付成功页面
- `/app/payment/cancel/page.tsx` - 支付取消页面

---

### 2. 国内支付集成 (支付宝 + 微信) 🟢

由于支付宝和微信支付需要企业资质，建议使用第三方聚合支付:

#### 推荐方案A: 使用 Stripe (也支持支付宝/微信)
Stripe 现在支持中国本地支付方式，包括支付宝和微信支付。

配置方式:
```javascript
// 在 Stripe Checkout 中添加
payment_method_types: ['card', 'alipay', 'wechat_pay']
```

优点:
- 统一的支付接口
- 不需要单独集成
- 支持多币种

#### 推荐方案B: 使用 Ping++
Ping++ 是一个支付聚合平台，支持支付宝、微信支付等。

1. 注册 Ping++ 账户: https://www.pingxx.com
2. 安装 SDK:
```bash
pnpm add pingpp-js
```

3. 配置环境变量:
```env
PINGPP_API_KEY="sk_test_..."
PINGPP_APP_ID="app_..."
```

4. 创建支付订单 API:
文件: `/app/api/payment/native/create-order/route.ts`

5. 创建支付回调 API:
文件: `/app/api/payment/native/webhook/route.ts`

6. 创建二维码支付页面:
文件: `/app/payment/qrcode/page.tsx`

显示二维码，用户扫码支付

---

## 实现优先级

### Phase 1: Stripe 基础支付 (推荐先做)
1. ✅ 价格配置 - 已完成
2. ⏳ Stripe Checkout API
3. ⏳ Stripe Webhook
4. ⏳ 成功/取消页面
5. ⏳ 测试支付流程

### Phase 2: 国内支付
1. 选择支付方案 (Stripe 或 Ping++)
2. 配置支付账户
3. 实现支付订单 API
4. 实现支付回调
5. 创建二维码页面
6. 测试支付流程

### Phase 3: 增强功能
1. 支付历史记录页面
2. 订单状态查询
3. 自动退款处理
4. 发票生成

---

## 数据库扩展 Schema (可选)

为了更好地管理支付订单，可以添加 PaymentOrder 模型:

```prisma
model PaymentOrder {
  id              String   @id @default(cuid())
  userId          String
  planId          String
  amount          Float
  currency        String   // CNY, USD
  paymentMethod   String   // stripe, alipay, wechat
  status          String   // pending, completed, failed, cancelled
  stripeSessionId String?  @unique
  pingppChargeId  String?  @unique
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  User            User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
}
```

迁移命令:
```bash
npx prisma migrate dev --name add_payment_orders
```

---

## 测试计划

### Stripe 测试
使用 Stripe 测试卡号:
- 成功: `4242 4242 4242 4242`
- 失败: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### 支付宝/微信测试
- 使用沙箱环境测试
- 或使用真实环境小额测试 (0.01 元)

---

## 安全注意事项

1. **永远不要在客户端存储 Secret Key**
2. **验证所有 Webhook 签名**
3. **使用 HTTPS** - 生产环境必须
4. **实现幂等性** - 防止重复支付
5. **记录所有支付日志** - 便于排查问题
6. **限制金额** - 防止异常充值

---

## 下一步行动

### 立即可做 (不需要真实支付账户)
1. 创建 Stripe Checkout API (使用测试模式)
2. 创建成功/取消页面
3. 使用 Stripe 测试卡号测试流程

### 需要账户后做
1. 注册 Stripe 账户
2. 配置生产环境 API Keys
3. 设置 Webhook
4. 上线测试

---

## 快速开始

想要快速测试支付流程吗？我可以帮你:

### 选项A: 完整实现 Stripe (推荐)
- 时间: ~2小时
- 需要: Stripe 测试账户 (免费)
- 结果: 完整的信用卡支付功能

### 选项B: 模拟支付 (仅测试)
- 时间: ~30分钟
- 需要: 无
- 结果: 可以测试充值流程，但不是真实支付

### 选项C: 只做 UI
- 时间: ~1小时
- 需要: 无
- 结果: 完整的支付页面 UI，后端接口留空

你想选择哪个选项？
