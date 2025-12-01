-- 完全禁用 RLS 策略，简化数据库访问
-- 所有数据都可以读取，只有所有者可以修改

-- 1. 删除所有现有的 RLS 策略
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can delete their rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view room participants" ON room_participants;
DROP POLICY IF EXISTS "Owners can add participants" ON room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Owners can remove participants" ON room_participants;
DROP POLICY IF EXISTS "Users can view BP states of their rooms" ON bp_states;
DROP POLICY IF EXISTS "Owners can update BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can insert BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can delete BP states" ON bp_states;
DROP POLICY IF EXISTS "Users can view room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can update room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can insert room settings" ON room_settings;
DROP POLICY IF EXISTS "Users can manage own room participants" ON room_participants;
DROP POLICY IF EXISTS "Users can view own room participants" ON room_participants;
DROP POLICY IF EXISTS "Users can manage BP states" ON bp_states;
DROP POLICY IF EXISTS "Users can view BP states" ON bp_states;
DROP POLICY IF EXISTS "Users can manage room settings" ON room_settings;

-- 2. 完全禁用 RLS（所有表）
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings DISABLE ROW LEVEL SECURITY;

-- 3. 可选：如果你想要一些基本的写保护（只能所有者修改），可以创建简单的策略
-- 如果你完全不需要任何限制，可以跳过这一步

-- 只有所有者可以修改自己的 profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 只有所有者可以修改自己的房间
CREATE POLICY "Owners can update their rooms" ON rooms
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their rooms" ON rooms
    FOR DELETE USING (auth.uid() = owner_id);

-- 启用这些表的 RLS（仅用于写保护）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 4. 验证 RLS 状态
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY tablename;

-- 5. 验证策略
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY tablename, policyname;