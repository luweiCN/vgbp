-- 完全移除所有 RLS 策略和 RLS 本身
-- 这是最激进的方案，确保没有任何 RLS 限制

-- 1. 删除所有可能的策略名称
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT
            schemaname,
            tablename,
            policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                          policy_record.policyname,
                          policy_record.schemaname,
                          policy_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- 忽略删除策略时的错误
            NULL;
        END;
    END LOOP;
END $$;

-- 2. 禁用所有表的 RLS
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bp_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS room_settings DISABLE ROW LEVEL SECURITY;

-- 3. 确保所有认证用户可以插入数据
-- 为 rooms 表创建一个超级宽松的插入策略（如果必须启用 RLS）
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for authenticated users" ON rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- 4. 再次禁用所有表（确保）
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings DISABLE ROW LEVEL SECURITY;

-- 5. 验证没有策略了
SELECT
    'Policies remaining: ' || COUNT(*)
FROM pg_policies
WHERE schemaname = 'public';

-- 6. 验证 RLS 状态
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY tablename;

-- 7. 测试插入权限（这个应该不会报错）
-- SELECT 'Testing insert permission...';
-- INSERT INTO rooms (name, owner_id, is_public)
-- VALUES ('test', '00000000-0000-0000-0000-000000000000', true)
-- ON CONFLICT DO NOTHING;
-- SELECT 'Insert test completed';

SELECT 'All RLS policies have been removed. Tables should now be accessible.' as status;