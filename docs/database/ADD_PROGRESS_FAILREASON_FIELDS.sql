-- 添加 progress 和 failReason 字段到 Task 表
-- 请在 Supabase SQL Editor 中执行此脚本

-- 添加 progress 字段(进度信息)
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "progress" TEXT;

-- 添加 failReason 字段(失败原因)
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "failReason" TEXT;

-- 验证列是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Task' AND column_name IN ('progress', 'failReason')
ORDER BY column_name;

-- 查看更新后的表结构
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'Task'
ORDER BY ordinal_position;
