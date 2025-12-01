-- 完全清理并重建数据库
-- 先删除所有现有策略和表

-- 1. 删除所有策略
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Users can manage own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can delete their rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view room participants" ON room_participants;
DROP POLICY IF EXISTS "Users can manage their participation" ON room_participants;
DROP POLICY IF EXISTS "Owners can add participants" ON room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Owners can remove participants" ON room_participants;

DROP POLICY IF EXISTS "Users can manage BP states" ON bp_states;
DROP POLICY IF EXISTS "Users can view BP states of their rooms" ON bp_states;
DROP POLICY IF EXISTS "Owners can update BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can insert BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can delete BP states" ON bp_states;

DROP POLICY IF EXISTS "Users can manage room settings" ON room_settings;
DROP POLICY IF EXISTS "Users can view room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can update room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can insert room settings" ON room_settings;

-- 2. 删除所有表（按依赖关系）
DROP TABLE IF EXISTS room_settings CASCADE;
DROP TABLE IF EXISTS bp_states CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. 删除触发器和函数
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_bp_states_updated_at ON bp_states;
DROP TRIGGER IF EXISTS update_room_settings_updated_at ON room_settings;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 4. 重新创建表结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间表
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  owner_id UUID,
  is_public BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间参与者表
CREATE TABLE room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- BP 状态表
CREATE TABLE bp_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  hero_id TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  selection_type TEXT DEFAULT 'ban' CHECK (selection_type IN ('ban', 'pick')),
  selected_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, hero_id, selection_type)
);

-- 房间设置表
CREATE TABLE room_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL UNIQUE,
  search_term TEXT DEFAULT '',
  hide_selected BOOLEAN DEFAULT false,
  classification_mode TEXT DEFAULT 'official' CHECK (classification_mode IN ('official', 'common', 'flex')),
  layout_mode TEXT DEFAULT 'auto' CHECK (layout_mode IN ('auto', '3', '4', '5')),
  current_visible_section TEXT CHECK (current_visible_section IN ('captain', 'jungle', 'carry', null)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_rooms_is_public ON rooms(is_public);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_bp_states_room_id ON bp_states(room_id);

-- 6. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bp_states_updated_at BEFORE UPDATE ON bp_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_settings_updated_at BEFORE UPDATE ON room_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;

-- 9. 创建 RLS 策略
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can view public rooms" ON rooms
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create rooms" ON rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own rooms" ON rooms
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own rooms" ON rooms
    FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Users can view room participants" ON room_participants
    FOR SELECT USING (user_id = auth.uid() OR room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can add participants" ON room_participants
    FOR INSERT WITH CHECK (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can remove participants" ON room_participants
    FOR DELETE USING (user_id = auth.uid() OR room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage BP states" ON bp_states
    FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage room settings" ON room_settings
    FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- 10. 验证表创建成功
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY table_name;