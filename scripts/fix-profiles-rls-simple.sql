-- 修改 profiles 表的 RLS 策略，允许所有人查看房间创建者的基本信息
-- 在 Supabase 项目的 SQL 编辑器中执行这些语句

-- 删除现有的 profiles 表查看策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 创建新的策略：允许所有人查看用户名和显示名称
CREATE POLICY "Anyone can view usernames and display names" ON profiles
    FOR SELECT USING (
        -- 允许查看用户名和显示名称，但不允许查看邮箱
        -- 这个策略允许所有 SELECT 操作，但我们会在应用层控制显示
        true
    );

-- 注意：这个策略允许查看所有字段，但我们会在应用层只显示用户名和显示名称
-- 如果需要更严格的控制，可以创建一个只包含公开字段的视图