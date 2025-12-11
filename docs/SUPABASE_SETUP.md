# 🗄️ Supabase 快速配置指南（5分钟）

## 步骤 1: 注册 Supabase

1. **打开浏览器访问：** https://supabase.com
2. **点击 "Start your project"**
3. **使用 GitHub 登录**（推荐）或邮箱注册

## 步骤 2: 创建项目

1. **创建组织**（如果是首次）
   - 名称：随意填写（如：My Projects）

2. **创建新项目**
   - 点击 "New Project"
   - **Name:** `sunoflow`
   - **Database Password:** 创建一个强密码
     - ⚠️ **重要：保存这个密码！**
     - 示例：`MyStr0ng!Pass2024`
   - **Region:** 选择离你最近的
     - 亚洲用户推荐：Singapore (Southeast Asia)
     - 美国用户：East US (North Virginia)
   - **Plan:** Free（免费版足够）
   - 点击 **"Create new project"**

3. **等待初始化**
   - 大约需要 1-2 分钟
   - 进度条显示 "Setting up project..."

## 步骤 3: 获取连接字符串

当项目准备好后：

1. **进入项目设置**
   - 点击左下角的齿轮图标 ⚙️
   - 或者点击 "Project Settings"

2. **进入 Database 页面**
   - 左侧菜单找到 "Database"

3. **找到 Connection Pooling**
   - 向下滚动到 "Connection Pooling" 部分
   - 确保选择 **"Session mode"**（默认）

4. **复制连接字符串**
   - 找到 **Connection string**
   - 点击复制按钮 📋
   - 字符串格式类似：
     ```
     postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - ⚠️ 注意：`[YOUR-PASSWORD]` 需要替换成你的实际密码！

## 步骤 4: 配置到 SunoFlow

### 方式 1：使用自动化脚本（推荐）

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow
./setup-database.sh
```

然后粘贴你的连接字符串。

### 方式 2：手动配置

```bash
# 编辑 .env 文件
code /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow/.env

# 或者使用命令行
nano /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow/.env
```

找到这一行：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sunoflow?schema=public"
```

替换为你的 Supabase 连接字符串：
```env
DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-region.pooler.supabase.com:6543/postgres"
```

保存文件。

## 步骤 5: 初始化数据库

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow

# 生成 Prisma Client
pnpm db:generate

# 推送数据库架构
pnpm db:push
```

看到 "✔ Your database is now in sync with your Prisma schema." 就成功了！

## 步骤 6: 验证配置

```bash
# 打开 Prisma Studio 查看数据库
pnpm db:studio
```

应该会在浏览器打开 http://localhost:5555，你会看到：
- User
- Wallet
- Transaction
- Task
- Upload

这5个表都已经创建好了！

## 🎉 完成！

现在可以启动应用了：

```bash
pnpm dev
```

打开 http://localhost:3000

---

## ⚠️ 常见问题

### Q1: 密码中有特殊字符怎么办？

如果密码包含特殊字符（如 `@`, `#`, `!` 等），需要 URL 编码：

```bash
# 示例：密码是 Pass@123!
# 需要编码为：Pass%40123%21

# 在线工具：https://www.urlencoder.org/
```

### Q2: "Error: P1001: Can't reach database server"

可能原因：
1. 等待项目完全初始化（再等1分钟）
2. 检查连接字符串是否正确
3. 确保使用的是 **Connection Pooling** 的 URL（端口 6543）
4. 检查防火墙/网络

### Q3: 想在 Supabase 面板查看数据

1. 访问 https://supabase.com/dashboard
2. 选择 sunoflow 项目
3. 左侧菜单点击 "Table Editor"
4. 可以直接查看和编辑数据

---

## 📸 截图参考

**获取连接字符串的位置：**

```
Supabase Dashboard
  └─ Project Settings (⚙️)
      └─ Database
          └─ Connection Pooling
              └─ Session mode
                  └─ Connection string [Copy] 📋
```

**需要的信息格式：**

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
             ↑                      ↑           ↑                                        ↑
          用户名              你的密码      服务器地址                                端口（6543）
```

---

**有问题？** 回到终端，我会帮你解决！
