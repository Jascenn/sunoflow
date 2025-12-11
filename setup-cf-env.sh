#!/bin/bash

# Cloudflare Pages 环境变量设置脚本
PROJECT_NAME="sunoflow"

echo "🔧 开始配置 Cloudflare Pages 环境变量..."

# 注意: 对于生产环境,你需要创建生产数据库
# 这里暂时使用测试环境的配置

# Clerk 环境变量
echo "📝 添加 Clerk 配置..."
echo "pk_test_bmljZS1naG9zdC05Ny5jbGVyay5hY2NvdW50cy5kZXYk" | wrangler pages secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --project-name=$PROJECT_NAME
echo "sk_test_gzR4lcg7na9FqOM8PxiKgIqey9nAca9kGgY1f9WTEH" | wrangler pages secret put CLERK_SECRET_KEY --project-name=$PROJECT_NAME
echo "/sign-in" | wrangler pages secret put NEXT_PUBLIC_CLERK_SIGN_IN_URL --project-name=$PROJECT_NAME
echo "/sign-up" | wrangler pages secret put NEXT_PUBLIC_CLERK_SIGN_UP_URL --project-name=$PROJECT_NAME
echo "/dashboard" | wrangler pages secret put NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL --project-name=$PROJECT_NAME
echo "/dashboard" | wrangler pages secret put NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL --project-name=$PROJECT_NAME

# Suno AI 配置
echo "📝 添加 Suno AI 配置..."
echo "302ai" | wrangler pages secret put SUNO_PROVIDER --project-name=$PROJECT_NAME
echo "https://api.302ai.cn" | wrangler pages secret put SUNO_BASE_URL --project-name=$PROJECT_NAME
echo "sk-32c4sSHL3z773NUx4ssmbO5KMc7SPKBUNgnm29Aotgb1297b" | wrangler pages secret put SUNO_API_KEY --project-name=$PROJECT_NAME

# 系统配置
echo "📝 添加系统配置..."
echo "production" | wrangler pages secret put NODE_ENV --project-name=$PROJECT_NAME

echo "✅ 环境变量配置完成!"
echo ""
echo "⚠️  重要提示:"
echo "1. 你还需要配置生产数据库 DATABASE_URL"
echo "2. 如果需要支付功能,需要添加 Stripe 配置"
echo "3. 建议使用 Supabase 或 Neon 作为生产数据库"
echo ""
echo "下一步: 创建生产数据库并运行:"
echo "  echo 'YOUR_DATABASE_URL' | wrangler pages secret put DATABASE_URL --project-name=$PROJECT_NAME"
