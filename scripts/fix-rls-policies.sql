-- 检查和修复RLS策略问题
-- 在 Supabase SQL 编辑器中执行

-- 1. 检查当前的RLS策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. 检查profiles表的RLS状态
SELECT 
    relname,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'profiles';

-- 3. 临时禁用RLS（仅用于测试）
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. 创建一个简单的查询测试
-- 请在浏览器控制台中手动测试这个查询
-- SELECT username, display_name FROM profiles WHERE id = '874868f0-6ab6-4de3-9f5b-4dbb189cc44e';

-- 5. 如果测试成功，重新启用RLS并创建正确的策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. 删除可能存在的有问题的策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 7. 创建正确的RLS策略
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. 验证策略创建结果
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';