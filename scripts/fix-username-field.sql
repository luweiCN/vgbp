-- 快速修复脚本：确保username字段存在
-- 如果遇到用户加载问题，请在 Supabase SQL 编辑器中执行此脚本

-- 1. 添加username字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'username'
    ) THEN
        ALTER TABLE profiles ADD COLUMN username TEXT;
    END IF;
END $$;

-- 2. 为现有用户设置默认username
UPDATE profiles 
SET username = split_part(email, '@', 1) 
WHERE username IS NULL OR username = '';

-- 3. 确保username不为空
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- 4. 添加唯一约束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_username_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 5. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. 验证数据
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as users_with_username
FROM profiles;