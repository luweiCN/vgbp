-- 修复 profiles 表的问题
-- 确保用户名正确保存

-- 1. 查看当前 profiles 表结构和数据
SELECT
    id,
    email,
    username,
    display_name,
    created_at
FROM profiles
LIMIT 5;

-- 2. 修改 RLS 策略，允许注册用户创建自己的 profile
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can create own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- 3. 为已存在的 auth.users 创建对应的 profiles 记录
INSERT INTO profiles (id, email, username, display_name)
SELECT
    id,
    email,
    COALESCE(email_part[1], 'user_' || substr(id::text, 1, 8)),
    COALESCE(email_part[2], email_part[1])
FROM (
    SELECT
        id,
        email,
        string_to_array(email, '@') as email_part
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM profiles)
) AS user_data;

-- 4. 验证修复结果
SELECT
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as profiles_with_username
FROM profiles;