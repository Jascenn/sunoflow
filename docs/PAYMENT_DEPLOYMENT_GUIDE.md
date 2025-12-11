# SunoFlow 支付系统部署指南

## 🎉 恭喜！支付系统已完成！

所有代码都已创建完成，现在只需要配置 Stripe 账户即可开始使用。

---

## ✅ 已完成的功能

### 1. 支付基础设施
- ✅ Stripe 依赖已安装
- ✅ 价格配置系统 ([lib/pricing.ts](lib/pricing.ts:1))
- ✅ Stripe 客户端配置 ([lib/stripe.ts](lib/stripe.ts:1))
- ✅ 环境变量占位符已添加

### 2. API 接口
- ✅ 创建支付会话 API ([app/api/payment/create-checkout/route.ts](app/api/payment/create-checkout/route.ts:1))
- ✅ 支付回调 Webhook API ([app/api/payment/webhook/route.ts](app/api/payment/webhook/route.ts:1))

### 3. 用户界面
- ✅ 充值页面 ([app/recharge/page.tsx](app/recharge/page.tsx:1))
- ✅ 支付成功页面 ([app/payment/success/page.tsx](app/payment/success/page.tsx:1))
- ✅ 支付取消页面 ([app/payment/cancel/page.tsx](app/payment/cancel/page.tsx:1))

### 4. 支付功能
- ✅ 信用卡支付
- ✅ 支付宝支付
- ✅ 微信支付
- ✅ 自动充值积分
- ✅ 交易记录
- ✅ Webhook 签名验证

---

## 🚀 立即开始使用

### 步骤 1: 注册 Stripe 账户

1. 访问 https://dashboard.stripe.com/register
2. 填写基本信息注册账户
3. 选择测试模式 (Test Mode)

### 步骤 2: 获取 API Keys

1. 登录 Stripe Dashboard
2. 点击右上角 "Developers" → "API keys"
3. 复制以下密钥：
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...) - 点击 "Reveal test key"

### 步骤 3: 更新环境变量

编辑 `.env` 文件,替换占位符:

```env
STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
```

### 步骤 4: 配置 Webhook (可选-生产环境需要)

#### 本地测试 (使用 Stripe CLI)

1. 安装 Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# 参考: https://stripe.com/docs/stripe-cli
```

2. 登录 Stripe:
```bash
stripe login
```

3. 转发 webhook 到本地:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

4. 复制显示的 webhook secret (whsec_...),更新到 `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"
```

#### 生产环境

1. 访问 https://dashboard.stripe.com/webhooks
2. 点击 "Add endpoint"
3. 输入 URL: `https://your-domain.com/api/payment/webhook`
4. 选择事件: `checkout.session.completed`
5. 复制 signing secret 到环境变量

### 步骤 5: 重启开发服务器

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow
pnpm dev
```

---

## 🧪 测试支付流程

### 1. 访问充值页面
```
http://localhost:3000/recharge
```

### 2. 选择套餐和支付方式

充值页面会显示：
- 4个充值套餐（入门/基础/专业/企业）
- 3种支付方式（信用卡/支付宝/微信）

### 3. 测试信用卡支付

使用 Stripe 测试卡号:
- **成功**: `4242 4242 4242 4242`
- CVV: 任意3位数字 (如 123)
- 日期: 任意未来日期 (如 12/34)
- 邮编: 任意 (如 12345)

### 4. 测试支付宝/微信支付

在 Stripe Checkout 页面:
- 选择 "Alipay" 或 "WeChat Pay"
- 会显示二维码或测试链接
- 测试模式下无需真实扫码

### 5. 验证充值成功

支付成功后:
1. 自动跳转到成功页面
2. 5秒后跳转回 Dashboard
3. 查看钱包余额是否增加

---

## 📊 当前套餐配置

| 套餐 | 价格 | 积分 | 赠送 | 总计 | 可生成歌曲 |
|------|------|------|------|------|------------|
| 入门 | ¥19 / $2.99 | 100 | 0 | 100 | 20首 |
| 基础 | ¥49 / $6.99 | 300 | 30 | 330 | 66首 |
| 专业 | ¥99 / $14.99 | 800 | 100 | 900 | 180首 |
| 企业 | ¥199 / $29.99 | 2000 | 300 | 2300 | 460首 |

---

## 🔧 故障排查

### 问题 1: "STRIPE_SECRET_KEY is not set"

**解决方案**: 检查 `.env` 文件是否正确配置了 Stripe 密钥

### 问题 2: Webhook 验证失败

**解决方案**:
- 本地测试: 确保 Stripe CLI 正在运行
- 生产环境: 确认 webhook secret 正确配置

### 问题 3: 数据库连接失败

**解决方案**:
- 检查 Supabase 数据库是否在线
- 参考 [DATABASE_CONNECTION_ISSUE.md](DATABASE_CONNECTION_ISSUE.md:1)

### 问题 4: 充值成功但积分未到账

**解决方案**:
1. 检查服务器日志中的 `[PAYMENT]` 消息
2. 确认 webhook 是否正确触发
3. 检查数据库 Transaction 表是否有记录

---

## 📝 数据库记录

### 充值成功后会创建两条记录:

1. **Wallet 记录** - 更新余额
```sql
UPDATE Wallet SET balance = balance + 积分 WHERE userId = '...'
```

2. **Transaction 记录** - 交易历史
```sql
INSERT INTO Transaction (
  userId, amount, type, description, referenceId
) VALUES (
  '...', 330, 'RECHARGE', '充值成功 - Stripe', 'cs_test_...'
)
```

---

## 🌐 部署到生产环境

### 1. 切换到生产模式

在 Stripe Dashboard:
1. 切换到 "Live mode"
2. 获取生产环境 API Keys
3. 配置生产环境 Webhook

### 2. 更新环境变量

```env
# 生产环境使用 sk_live_ 和 pk_live_ 开头的密钥
STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_LIVE_WEBHOOK_SECRET"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. 重新部署应用

---

## 💡 高级配置

### 自定义套餐

编辑 [lib/pricing.ts](lib/pricing.ts:13):

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'custom',
    name: '自定义套餐',
    credits: 500,
    price: 79,
    priceUSD: 11.99,
    bonus: 50,
    savings: '赠送 50 积分',
  },
  // ... 其他套餐
];
```

### 修改支付方式

编辑 [app/api/payment/create-checkout/route.ts](app/api/payment/create-checkout/route.ts:28):

```typescript
payment_method_types: ['card'], // 只支持信用卡
// 或
payment_method_types: ['card', 'alipay'], // 只支持信用卡和支付宝
```

---

## 📚 相关文档

- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe Checkout 集成指南](https://stripe.com/docs/payments/checkout)
- [Stripe Webhook 文档](https://stripe.com/docs/webhooks)
- [Stripe 测试卡号](https://stripe.com/docs/testing)

---

## ✨ 下一步

现在支付系统已经完全就绪！你可以:

1. **立即测试**: 访问 http://localhost:3000/recharge
2. **查看日志**: 服务器会输出详细的支付日志
3. **监控交易**: 在 Stripe Dashboard 查看所有交易

**需要帮助?** 查看故障排查部分或联系我！

---

**创建时间**: 2025-12-06
**状态**: ✅ 完成并可用
**下一步**: 配置 Stripe 账户并测试
