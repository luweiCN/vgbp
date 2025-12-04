-- 移除用户名唯一性约束
-- 允许多个用户使用相同的用户名
-- 日期：2024-12-03

-- 首先删除 profiles 表中的 username 唯一约束
-- 注意：约束名称可能是 'profiles_username_key' 或类似的名称
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- 如果约束名称不同，可能需要手动指定具体的约束名
-- 可以通过以下命令查看约束名称：
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass;

-- 验证修改结果
-- 现在用户名可以重复，只有邮箱保持唯一性