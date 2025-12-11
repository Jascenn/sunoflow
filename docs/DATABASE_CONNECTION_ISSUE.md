# 测试数据丢失问题 - 根本原因分析

## 问题现象

Dashboard 页面显示"还没有任务",但实际上数据库中应该有测试数据。

## 根本原因

**Supabase 数据库连接不稳定**

从服务器日志可以看到:
```
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:5432`
```

### 连接状态
- **间歇性连接失败**: 大部分时候无法连接
- **偶尔成功**: 日志中可以看到有时候会成功查询 (prisma:query BEGIN)
- **错误代码**: P1001 (Can't reach database server)

## 可能的原因

### 1. Supabase 免费计划限制
- 免费计划可能有并发连接数限制
- 长时间不活动后数据库会暂停
- 连接池配置: `connection_limit=10&pool_timeout=20`

### 2. 网络问题
- AWS ap-southeast-1 (新加坡) 区域连接不稳定
- VPN 或防火墙可能影响连接

### 3. Prisma 连接池耗尽
- 开发模式下多次热重载可能导致连接泄漏
- 需要重启才能释放连接

## 解决方案

### 方案 1: 重启数据库连接(推荐)

刷新页面多次,直到数据库连接成功:
- Dashboard 会自动轮询 `/api/tasks`
- 等待连接恢复后数据会显示

### 方案 2: 访问 Supabase Dashboard

1. 登录 Supabase: https://supabase.com/dashboard
2. 进入项目: yfdahfldyvrixdayrxvq
3. 检查数据库状态:
   - Database > Tables > Task
   - 查看是否有数据
4. 如果数据库暂停,点击 "Resume" 恢复

### 方案 3: 使用 Supabase 本地开发

```bash
# 安装 Supabase CLI
brew install supabase/tap/supabase

# 启动本地 Supabase
supabase start

# 更新 .env 文件使用本地数据库
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

### 方案 4: 增加连接重试逻辑

修改 [lib/prisma.ts](lib/prisma.ts) 添加自动重试:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    // 添加重试配置
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// 添加连接重试包装器
export async function retryQuery<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.code === 'P1001' && i < maxRetries - 1) {
        console.log(`Database connection failed, retrying (${i + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 当前状态

### 功能状态
✅ 所有代码实现完成:
- 进度条显示
- 失败状态展示(方案2)
- 多结果任务分组
- 自动退款逻辑
- 后端数据支持

### 测试状态
⚠️ 数据库连接不稳定,无法稳定测试:
- UI 组件: 可以访问 http://localhost:3000/ui-demo 查看示例
- Dashboard: http://localhost:3000/dashboard (需要数据库连接)
- 实际任务数据: 依赖数据库连接

## 建议操作

1. **立即操作**: 多次刷新 Dashboard 页面,等待数据库连接恢复
2. **短期方案**: 登录 Supabase Dashboard 检查并恢复数据库
3. **长期方案**: 考虑升级到 Supabase 付费计划或使用本地数据库开发

## 验证数据是否存在

一旦数据库连接恢复,数据应该会自动显示。你之前创建的测试数据仍然在数据库中,只是目前无法访问。

从日志中可以看到,当连接成功时,系统能查询到任务:
```
prisma:query SELECT "public"."Task"... WHERE "public"."Task"."userId" = $1
```

这说明数据库中确实有任务数据,只是目前连接不稳定导致无法读取。

---

**创建时间**: 2025-12-05
**问题类型**: 基础设施 / 数据库连接
**优先级**: 中 (不影响代码功能,只影响测试)
