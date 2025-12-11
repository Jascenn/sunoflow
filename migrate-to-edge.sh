#!/bin/bash

# 批量修改所有 API 路由使用 Edge Runtime

cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow

echo "🔧 开始批量修改 API 路由为 Edge Runtime..."

# 找到所有包含 nodejs runtime 的文件并替换为 edge
find app/api -name "route.ts" -type f | while read file; do
  if grep -q 'export const runtime = .nodejs.' "$file"; then
    echo "✏️  修改: $file"
    sed -i '' 's/export const runtime = .nodejs./export const runtime = '\''edge'\'';/g' "$file"
  elif ! grep -q 'export const runtime' "$file"; then
    echo "➕ 添加 edge runtime 到: $file"
    # 在文件顶部导入语句后添加 runtime 配置
    sed -i '' '/^import/a\
\
export const runtime = '\''edge'\'';
' "$file"
  fi
done

# 同样修改 sign-in 和 sign-up 页面
find app/sign-in app/sign-up -name "page.tsx" -type f 2>/dev/null | while read file; do
  if ! grep -q 'export const runtime' "$file"; then
    echo "➕ 添加 edge runtime 到: $file"
    sed -i '' '1i\
export const runtime = '\''edge'\'';\

' "$file"
  fi
done

echo "✅ 修改完成!"
