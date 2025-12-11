#!/bin/bash

# 清理重复的 runtime 声明

cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow

echo "🧹 清理重复的 runtime 声明..."

# 找到所有包含重复 runtime 的文件
find app -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # 计算文件中 runtime 出现的次数
  count=$(grep -c "export const runtime = 'edge';" "$file" 2>/dev/null || echo "0")

  if [ "$count" -gt 1 ]; then
    echo "🔧 修复: $file (有 $count 个 runtime 声明)"
    # 使用 awk 只保留第一个 runtime 声明
    awk '
      BEGIN { found=0 }
      /export const runtime = .edge.;/ {
        if (found == 0) {
          print
          found=1
        }
        next
      }
      { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

echo "✅ 清理完成!"
