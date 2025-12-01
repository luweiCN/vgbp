-- 添加username字段的迁移脚本
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

-- 3. 添加唯一约束
ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 4. 添加非空约束
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- 5. 创建username索引
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. 更新触发器，确保username字段也有更新时间
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 更新用户创建触发器，包含username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();