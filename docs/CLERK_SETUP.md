# 🔐 Clerk 认证快速配置指南（3分钟）

## 步骤 1: 注册 Clerk 账号（1分钟）

1. **打开浏览器访问：** https://clerk.com

2. **点击右上角 "Sign Up"**

3. **使用 GitHub 登录**（推荐，一键注册）
   - 或者使用 Email 注册也可以

---

## 步骤 2: 创建应用（1分钟）

登录后会自动提示创建应用：

1. **Application name:** `SunoFlow`

2. **选择登录方式（推荐配置）：**
   - ✅ Email address（邮箱）
   - ✅ Google OAuth（Google 登录）
   - ✅ GitHub OAuth（GitHub 登录）
   - 其他可选（可以稍后添加）

3. **点击 "Create Application"**

4. 等待几秒钟，应用创建完成

---

## 步骤 3: 获取 API Keys（30秒）

创建完成后，会自动显示 API Keys 页面！

你会看到类似这样的界面：

```
┌────────────────────────────────────────────────────────┐
│  🔑 API Keys                                           │
│                                                        │
│  Publishable key                            [Copy] 📋  │
│  ┌──────────────────────────────────────────────────┐ │
│  │ pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Secret key                                 [Copy] 📋  │
│  ┌──────────────────────────────────────────────────┐ │
│  │ sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⚠️  Keep your secret key safe and never expose it    │
│     in client-side code                               │
└────────────────────────────────────────────────────────┘
```

**需要复制两个密钥：**
1. **Publishable key** (以 `pk_test_` 开头)
2. **Secret key** (以 `sk_test_` 开头)

---

## 步骤 4: 配置到 SunoFlow

### 方式 A：告诉我密钥（推荐）

把两个密钥发给我：
```
Publishable key: pk_test_...
Secret key: sk_test_...
```

我来帮您更新 `.env` 文件。

### 方式 B：手动配置

编辑 `.env` 文件：

```bash
code /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow/.env
```

找到这两行：
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

替换成你的实际密钥。

---

## 步骤 5: 重启开发服务器

配置完成后，在终端按 `Ctrl + C` 停止服务器，然后重新运行：

```bash
pnpm dev
```

---

## 🎯 如果找不到 API Keys

在 Clerk Dashboard 中：

1. 左侧菜单找到 **"API Keys"**
2. 或者点击右上角的项目名称 → Settings → API Keys

---

## ✅ 配置完成后

访问 http://localhost:3001

你应该能看到：
- 登录/注册按钮正常工作
- 可以用邮箱、Google 或 GitHub 登录
- 登录后自动创建用户并分配 100 积分

---

## 🔧 配置 Clerk Webhook（可选但推荐）

为了在用户注册时自动创建钱包，需要配置 Webhook：

### 开发环境（使用 ngrok）

1. **安装 ngrok**（如果还没有）：
   ```bash
   brew install ngrok
   # 或访问 https://ngrok.com 下载
   ```

2. **启动 ngrok 隧道**：
   ```bash
   ngrok http 3001
   ```

3. **复制 ngrok URL**（如 `https://abc123.ngrok.io`）

4. **在 Clerk Dashboard**：
   - 左侧菜单 → **Webhooks**
   - 点击 **"Add Endpoint"**
   - **Endpoint URL:** `https://abc123.ngrok.io/api/webhooks/clerk`
   - **Subscribe to events:** 选择 `user.created`
   - 点击 **"Create"**

5. **测试**：
   - 注册一个新用户
   - 检查数据库（`pnpm db:studio`）
   - 应该能看到 User 和 Wallet 自动创建了

### 生产环境

将 ngrok URL 替换为你的实际域名：
```
https://your-domain.com/api/webhooks/clerk
```

---

## 💡 提示

**Publishable Key** 是公开的，可以在前端使用
**Secret Key** 是私密的，只能在服务器端使用

已经在代码中正确配置了：
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → 前端可见
- `CLERK_SECRET_KEY` → 仅后端使用

---

## 🆘 常见问题

### Q1: 登录后显示 "User not found"

**原因：** Webhook 未配置，用户没有自动创建到数据库

**解决：**
1. 配置 Clerk Webhook（见上文）
2. 或者手动在数据库创建用户记录

### Q2: 密钥显示为 "hidden"

点击密钥右边的眼睛图标 👁️ 显示完整密钥。

### Q3: 测试账号无法登录

确保在 Clerk Dashboard 的 "Restrictions" 中没有限制测试环境的邮箱。

---

**准备好了吗？** 现在去注册 Clerk 吧！

1. 访问 https://clerk.com
2. 注册并创建应用
3. 复制两个密钥
4. 回来告诉我，我帮你配置！
