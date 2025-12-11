-- 添加 isFavorite 字段到 Task 表
-- 请在 Supabase SQL Editor 中执行此脚本

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- 验证列是否添加成功
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Task' AND column_name = 'isFavorite';
