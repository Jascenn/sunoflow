# 模拟支付测试指南

## 📋 概述

为了方便在没有配置 Stripe 的情况下测试支付流程,我们添加了**模拟支付功能**。这个功能允许您在开发环境中测试完整的支付流程,而无需真实付款。

---

## 🎯 功能特性

### 模拟支付功能
- ✅ 无需配置 Stripe API 密钥
- ✅ 直接在数据库中增加积分
- ✅ 完整的支付流程体验
- ✅ 自动创建交易记录
- ✅ 一键开关切换模式

### 真实支付功能
- 💳 支持信用卡支付
- 💳 支持支付宝
- 💳 支持微信支付
- 🔒 Stripe 安全保障

---

## 🚀 快速开始

### 1. 访问充值页面

打开浏览器访问:
```
http://localhost:3000/recharge
```

### 2. 确认模拟支付模式已开启

在充值页面顶部,您会看到一个黄色的"开发测试模式"横幅:

```
┌─────────────────────────────────────────────┐
│ 💥 开发测试模式                              │
│ 使用模拟支付(无需真实付款)      [🔘 开启]   │
└─────────────────────────────────────────────┘
```

**开关说明:**
- 🟡 **开启** (默认): 使用模拟支付,无需真实付款
- ⚫ **关闭**: 使用真实 Stripe 支付,需要配置 API

### 3. 选择充值套餐

点击任意套餐卡片进行选择:

| 套餐 | 基础积分 | 赠送积分 | 总积分 | 价格 |
|------|---------|---------|--------|------|
| 入门套餐 | 100 | 0 | 100 | ¥19 |
| 基础套餐 | 300 | 30 | 330 | ¥49 🔥 |
| 专业套餐 | 800 | 100 | 900 | ¥99 |
| 企业套餐 | 2000 | 300 | 2300 | ¥199 |

### 4. 确认支付

点击底部的"立即支付"按钮:
```
┌─────────────────────────────────────────────┐
│ 已选套餐: 基础套餐                           │
│ 330 积分                                     │
│                                支付金额:      │
│                                ¥49 ($6.99)   │
│                                              │
│  [💳 立即支付 ¥49]                          │
│                                              │
│  支持信用卡 / 支付宝 / 微信支付              │
└─────────────────────────────────────────────┘
```

### 5. 查看成功页面

支付后会跳转到成功页面,显示:
- ✅ 充值成功提示
- 📦 充值套餐信息
- 💰 获得的积分数量
- 🎉 测试模式标识

### 6. 返回 Dashboard

5秒后自动跳转,或点击"返回控制台"按钮。

### 7. 验证积分到账

在 Dashboard 页面查看钱包余额是否增加。

---

## 🔍 测试流程

### 完整测试步骤

```bash
1. 访问充值页面
   http://localhost:3000/recharge

2. 确认当前余额
   例: 0 积分

3. 开启模拟支付模式 (默认已开启)
   看到黄色横幅提示

4. 选择"基础套餐"
   300 + 30 = 330 积分

5. 点击"立即支付"
   看到提示: "使用模拟支付进行测试"

6. 跳转到成功页面
   显示: +330 积分

7. 返回 Dashboard
   验证余额: 0 + 330 = 330 积分

8. 查看交易记录 (可选)
   在 Prisma Studio 查看 Transaction 表
```

---

## 📂 技术实现

### 文件结构

```
sunoflow/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── create-checkout/     # 真实 Stripe 支付
│   │       │   └── route.ts
│   │       ├── mock-checkout/       # 模拟支付 (新增)
│   │       │   └── route.ts
│   │       └── webhook/             # Stripe webhook
│   │           └── route.ts
│   ├── payment/
│   │   ├── success/                 # 真实支付成功页面
│   │   │   └── page.tsx
│   │   ├── mock-success/            # 模拟支付成功页面 (新增)
│   │   │   └── page.tsx
│   │   └── cancel/
│   │       └── page.tsx
│   └── recharge/
│       └── page.tsx                 # 充值页面 (已更新)
└── lib/
    └── pricing.ts                   # 套餐配置
```

### API 端点

#### 模拟支付接口
```typescript
POST /api/payment/mock-checkout
{
  "planId": "basic"  // starter, basic, pro, enterprise
}

Response:
{
  "url": "/payment/mock-success?session_id=xxx&plan=xxx&credits=xxx",
  "mock": true,
  "message": "Mock payment successful"
}
```

#### 真实支付接口
```typescript
POST /api/payment/create-checkout
{
  "planId": "basic"
}

Response:
{
  "url": "https://checkout.stripe.com/xxx"
}
```

### 数据库操作

模拟支付会执行以下操作:

```typescript
// 1. 更新钱包余额
await prisma.wallet.upsert({
  where: { userId },
  update: { balance: { increment: totalCredits } },
  create: { userId, balance: totalCredits }
});

// 2. 创建交易记录
await prisma.transaction.create({
  data: {
    userId,
    amount: totalCredits,
    type: 'RECHARGE',
    description: `模拟充值 - ${plan.name}`,
    referenceId: mockSessionId
  }
});
```

---

## 🎨 UI 组件

### 模拟支付开关

```tsx
<div className="bg-yellow-50 border border-yellow-200">
  <div className="flex items-center justify-between">
    <div>
      <p>开发测试模式</p>
      <p>{useMockPayment ? '使用模拟支付' : '使用真实支付'}</p>
    </div>
    <button onClick={() => setUseMockPayment(!useMockPayment)}>
      {/* Toggle 开关 */}
    </button>
  </div>
</div>
```

---

## 🐛 调试技巧

### 1. 查看控制台日志

模拟支付会输出详细日志:

```bash
[MOCK PAYMENT] Creating mock payment for user xxx
[MOCK PAYMENT] Plan: 基础套餐, Credits: 330
[MOCK PAYMENT] Success! New balance: 330
```

### 2. 使用 Prisma Studio

查看数据库变化:
```bash
pnpm prisma studio
```

打开 `http://localhost:5555` 查看:
- **Wallet** 表: 余额变化
- **Transaction** 表: 交易记录

### 3. 检查网络请求

打开浏览器开发者工具 → Network 标签:
```
POST /api/payment/mock-checkout
Status: 200
Response: { url: "/payment/mock-success?...", mock: true }
```

---

## 🔄 切换到真实支付

### 步骤

1. **配置 Stripe API 密钥**

编辑 `.env` 文件:
```env
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

2. **关闭模拟支付模式**

在充值页面点击开关,将其切换到"关闭"状态。

3. **测试真实支付**

选择套餐并支付,会跳转到 Stripe Checkout 页面。

---

## ⚠️ 注意事项

### 开发环境
- ✅ 默认启用模拟支付
- ✅ 适合快速测试功能
- ✅ 不会产生真实费用
- ⚠️ 不验证支付安全性

### 生产环境
- ❌ 必须禁用模拟支付
- ✅ 必须配置真实 Stripe
- ✅ 必须配置 Webhook
- 🔒 确保支付安全

### 建议配置

在生产环境中,可以通过环境变量控制:

```typescript
// recharge/page.tsx
const [useMockPayment, setUseMockPayment] = useState(
  process.env.NODE_ENV === 'development' // 仅开发环境启用
);
```

或完全移除模拟支付代码。

---

## 📊 测试场景

### 场景 1: 首次充值
```
初始余额: 0
充值套餐: 入门套餐 (100 积分)
预期结果: 100 积分
```

### 场景 2: 多次充值
```
初始余额: 100
充值套餐: 基础套餐 (330 积分)
预期结果: 430 积分
```

### 场景 3: 大额充值
```
初始余额: 500
充值套餐: 企业套餐 (2300 积分)
预期结果: 2800 积分
```

### 场景 4: 交易记录
```
充值 3 次后
Transaction 表应该有 3 条记录
每条记录包含:
- userId
- amount
- type: RECHARGE
- description: 模拟充值 - XXX套餐
- referenceId: mock_session_xxx
```

---

## 🎯 下一步

完成模拟支付测试后,您可以:

1. **测试音乐生成功能**
   - 使用充值的积分生成音乐
   - 验证积分扣减是否正确

2. **配置真实支付**
   - 注册 Stripe 账号
   - 配置 API 密钥
   - 测试真实支付流程

3. **配置 Webhook**
   - 设置 Stripe Webhook URL
   - 测试支付回调
   - 验证积分自动到账

---

## 🆘 常见问题

### Q1: 模拟支付后积分没有到账?

**A:** 检查:
1. 数据库连接是否正常
2. 控制台是否有错误日志
3. Prisma Studio 中 Wallet 表是否更新

### Q2: 如何重置测试数据?

**A:** 使用 Prisma Studio:
1. 打开 `http://localhost:5555`
2. 删除 Wallet 表中的记录
3. 删除 Transaction 表中的记录
4. 重新测试

### Q3: 模拟支付开关不显示?

**A:** 确保:
1. 充值页面已更新到最新版本
2. 浏览器缓存已清除
3. 开发服务器已重启

### Q4: 点击支付后没有跳转?

**A:** 检查:
1. 浏览器控制台是否有错误
2. Network 标签中 API 请求状态
3. 后端日志输出

---

## 📝 总结

模拟支付功能让您能够:
- ✅ 快速测试支付流程
- ✅ 验证业务逻辑
- ✅ 无需配置第三方服务
- ✅ 节省开发时间

记得在生产环境中禁用模拟支付! 🚀

---

**祝测试愉快!** 🎉

如有问题,请查看:
- [支付系统完整指南](./PAYMENT_SYSTEM_COMPLETE.md)
- [部署指南](./PAYMENT_DEPLOYMENT_GUIDE.md)
- [集成指南](./PAYMENT_INTEGRATION_GUIDE.md)
