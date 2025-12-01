-- 最简化的工作数据库恢复
-- 只创建必要的表，去掉复杂的依赖关系

-- 1. 删除所有现有策略和表
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can delete their rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view room participants" ON room_participants;
DROP POLICY IF EXISTS "Owners can add participants" ON room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Owners can remove participants" ON room_participants;

DROP POLICY IF EXISTS "Users can manage room settings" ON room_settings;
DROP POLICY IF EXISTS "Users can view room settings" ON room_settings;

DROP TABLE IF EXISTS room_settings CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS bp_states CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. 创建简化的表结构（移除外键依赖）

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表（简化版，不依赖 auth.users）
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间表（简化版，移除 profiles 外键）
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

-- 房间参与者表（简化版，移除 profiles 外键）
CREATE TABLE room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- BP 状态表（简化版）
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

-- 房间设置表（简化版，移除复杂依赖）
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

-- 3. 创建索引
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_rooms_is_public ON rooms(is_public);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_bp_states_room_id ON bp_states(room_id);

-- 4. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;

-- 5. 创建简化的 RLS 策略（不依赖复杂的子查询）

CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (id = auth.uid() OR id IS NULL);

CREATE POLICY "Anyone can view public rooms" ON rooms
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own rooms" ON rooms
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users can manage room participants" ON room_participants
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage BP states" ON bp_states
    FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage room settings" ON room_settings
    FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()));

-- 6. 验证表创建成功
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY table_name;