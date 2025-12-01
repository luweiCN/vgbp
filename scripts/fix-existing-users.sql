-- 检查和修复现有用户的username字段
-- 在 Supabase SQL 编辑器中执行

-- 1. 首先检查当前数据状态
SELECT 
    id,
    email,
    username,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. 检查有多少用户缺少username
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as missing_username,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as has_username
FROM profiles;

-- 3. 为所有缺少username的用户设置默认值
UPDATE profiles 
SET username = 
    CASE 
        WHEN username IS NULL OR username = '' THEN split_part(email, '@', 1)
        ELSE username
    END,
    updated_at = NOW()
WHERE username IS NULL OR username = '';

-- 4. 验证修复结果
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as users_with_username,
    COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as users_missing_username
FROM profiles;

-- 5. 显示修复后的用户数据
SELECT 
    id,
    email,
    username,
    created_at,
    updated_at
FROM profiles 
ORDER BY updated_at DESC 
LIMIT 5;