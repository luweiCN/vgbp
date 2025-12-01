-- 安全的username字段迁移脚本（修复语法错误）
-- 在 Supabase SQL 编辑器中执行

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

-- 2. 为现有用户生成默认username（使用邮箱前缀）
UPDATE profiles 
SET username = split_part(email, '@', 1) 
WHERE username IS NULL OR username = '';

-- 3. 安全添加唯一约束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' AND constraint_name = 'profiles_username_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 4. 添加非空约束（如果还没有）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'username' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
    END IF;
END $$;

-- 5. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. 更新用户创建触发器（安全版本）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 使用INSERT ... ON CONFLICT来避免重复插入
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, split_part(new.email, '@', 1))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 验证结果
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as users_with_username,
    COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as users_missing_username
FROM profiles;