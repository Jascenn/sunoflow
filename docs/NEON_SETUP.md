# 🚀 Neon 数据库快速配置（2分钟搞定）

Neon 比 Supabase 简单多了！注册完立即显示连接字符串。

## 步骤 1: 注册 Neon（30秒）

1. **打开浏览器访问：** https://neon.tech

2. **点击右上角 "Sign Up"**

3. **使用 GitHub 登录**（推荐，一键登录）
   - 或者用 Google/Email 也可以

4. 授权后会自动跳转到 Dashboard

## 步骤 2: 创建项目（1分钟）

登录后会自动提示创建项目：

1. **填写项目信息：**
   - Project name: `sunoflow`
   - Region: 选择离你最近的
     - 亚洲：Singapore 或 AWS Asia Pacific (Singapore)
     - 美国：US East (Ohio)
   - Postgres version: 选择最新版（默认即可）

2. **点击 "Create Project"**

3. **等待 5-10 秒**，项目会立即创建好

## 步骤 3: 复制连接字符串（10秒）

项目创建后，**会立即弹出一个对话框显示连接信息**！

你会看到类似这样的界面：

```
┌──────────────────────────────────────────────────────┐
│  🎉 Connection Details                               │
│                                                       │
│  Connection string:                         [Copy] 📋 │
│  ┌────────────────────────────────────────────────┐  │
│  │ postgresql://username:password@ep-xxx.aws-xxx  │  │
│  │ .neon.tech/neondb?sslmode=require              │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  Database: neondb                                     │
│  User: username                                       │
│  Password: ••••••••••                                 │
│                                                       │
│  [I've saved these details]                           │
└──────────────────────────────────────────────────────┘
```

**点击 📋 Copy 按钮** 复制完整的连接字符串！

⚠️ **重要：** 这个弹窗只显示一次！复制后再点"I've saved these details"

---

## 步骤 4: 配置到 SunoFlow

### 方式 A：自动配置脚本

回到终端，运行：

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow
./setup-database.sh
```

粘贴你刚才复制的连接字符串。

### 方式 B：直接告诉我

把你复制的连接字符串发给我，我帮你配置。

---

## 🔄 如果关闭了弹窗忘记复制？

别担心，可以重新获取：

1. 在 Neon Dashboard，进入你的项目
2. 点击 **"Connection Details"** 或 **"Dashboard"**
3. 找到 **"Connection string"** 部分
4. 点击眼睛图标 👁️ 显示密码
5. 点击 Copy 按钮复制

或者直接在项目页面看：

```
Dashboard 首页
  ↓
选择 "sunoflow" 项目
  ↓
右上角 "Connection Details" 按钮
  ↓
或者看左侧 "Quickstart" 面板
```

---

## ✨ Neon 的优势

✅ **连接字符串直接显示** - 无需到处找
✅ **自动包含密码** - 不用手动替换
✅ **自动启用 SSL** - 更安全
✅ **即时创建** - 无需等待
✅ **完全免费** - 0.5GB 存储，足够用

---

## 📋 连接字符串格式

Neon 的连接字符串格式：

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

示例：
```
postgresql://alex:AbC123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

特点：
- ✅ 密码已经包含在内
- ✅ 自动带 SSL 参数
- ✅ 可以直接使用，无需修改

---

## 🎯 完整流程回顾

1. 访问 https://neon.tech
2. GitHub 登录
3. 创建项目 "sunoflow"
4. 立即看到连接字符串弹窗
5. 复制连接字符串
6. 回到终端运行 `./setup-database.sh`
7. 粘贴连接字符串
8. 完成！

---

## 💡 准备好了吗？

现在就去注册 Neon 吧！

1. **打开浏览器：** https://neon.tech
2. **Sign Up with GitHub**
3. **创建项目**
4. **复制连接字符串**
5. **回来告诉我，或直接运行脚本**

超级简单，2分钟搞定！🚀
