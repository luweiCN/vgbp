-- Database Structure Backup
-- Generated on: $(date)
-- Project: vainglory-draft-assistant
-- Schema: public

-- Drop existing tables if they exist (for clean restore)
DROP TABLE IF EXISTS verification_codes CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS heroes CASCADE;

-- Create tables

-- Profiles table (user profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    username text,
    avatar_url text,
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT profiles_username_check CHECK ((char_length(username) >= 3)),
    CONSTRAINT username_length CHECK ((char_length(username) <= 20))
);

-- Heroes table (Vainglory heroes data)
CREATE TABLE IF NOT EXISTS public.heroes (
    id text NOT NULL,
    name text NOT NULL,
    cn_name text NOT NULL,
    role text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT heroes_pkey PRIMARY KEY (id)
);

-- Rooms table (game rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    creator_id uuid NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    max_players integer NOT NULL DEFAULT 12,
    current_players integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'waiting'::text,
    settings jsonb NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT rooms_pkey PRIMARY KEY (id),
    CONSTRAINT rooms_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'in_progress'::text, 'completed'::text]))),
    CONSTRAINT rooms_current_players_check CHECK ((current_players >= 0)),
    CONSTRAINT rooms_max_players_check CHECK ((max_players > 0))
);

-- Verification codes table (for user registration/verification)
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT verification_codes_pkey PRIMARY KEY (id),
    CONSTRAINT verification_codes_email_code_key UNIQUE (email, code)
);

-- RLS (Row Level Security) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can update their own username" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Heroes RLS Policies (read-only for all users)
CREATE POLICY "Enable read access for all users" ON public.heroes FOR SELECT USING (true);

-- Rooms RLS Policies
CREATE POLICY "Users can view public rooms or rooms they are part of" ON public.rooms FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can insert rooms they create" ON public.rooms FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update rooms they created" ON public.rooms FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete rooms they created" ON public.rooms FOR DELETE USING (creator_id = auth.uid());

-- Verification codes RLS Policies
CREATE POLICY "Enable read access for all users" ON public.verification_codes FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.verification_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.verification_codes FOR UPDATE WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.verification_codes FOR DELETE WITH CHECK (true);

-- Foreign Key Constraints
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_id_fkey;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.rooms VALIDATE CONSTRAINT rooms_creator_id_fkey;

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles USING btree (username);
CREATE INDEX IF NOT EXISTS rooms_creator_id_idx ON public.rooms USING btree (creator_id);
CREATE INDEX IF NOT EXISTS rooms_is_public_idx ON public.rooms USING btree (is_public);
CREATE INDEX IF NOT EXISTS rooms_status_idx ON public.rooms USING btree (status);
CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON public.verification_codes USING btree (email);
CREATE INDEX IF NOT EXISTS verification_codes_expires_at_idx ON public.verification_codes USING btree (expires_at);

-- Triggers and Functions

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$;

-- Trigger to create profile on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$function$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.heroes TO authenticated;
GRANT ALL ON public.rooms TO authenticated;
GRANT ALL ON public.verification_codes TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.heroes TO service_role;
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.verification_codes TO service_role;

-- Initial Heroes Data (optional - can be moved to separate migration)
INSERT INTO public.heroes (id, name, cn_name, role) VALUES
('adagio', 'Adagio', '魔乐师', 'Support'),
('alpha', 'Alpha', '阿尔法', 'Assassin'),
('ambassador', 'Ambassador', '使者', 'Support'),
('ardan', 'Ardan', '亚丹', 'Support'),
('baptiste', 'Baptiste', '浸礼者', 'Support'),
('baron', 'Baron', '巴龙', 'Tank'),
('blackfeather', 'Blackfeather', '黑羽', 'Assassin'),
('catherine', 'Catherine', '凯瑟琳', 'Tank'),
('celeste', 'Celeste', '女警', 'Mage'),
('cho', 'Cho', '乔', 'Tank'),
('dot', 'Dot', '多多', 'Support'),
('flicker', 'Flicker', '弗兰克', 'Support'),
('fortress', 'Fortress', '堡垒', 'Tank'),
('glaive', 'Glaive', '战斧', 'Assassin'),
('grumpjaw', 'Grumpjaw', '熊人', 'Tank'),
('gwen', 'Gwen', '格温', 'Assassin'),
('harley', 'Harley', '哈雷', 'Mage'),
('idris', 'Idris', '伊德里斯', 'Assassin'),
('ironcrow', 'Ironcrow', '钢铁乌鸦', 'Tank'),
('izell', 'Izell', '伊泽尔', 'Mage'),
('joule', 'Joule', '朱尔', 'Assassin'),
'kensei', 'Kensei', '剑圣', 'Assassin'),
('koshka', 'Koshka', '猫女', 'Assassin'),
('krul', 'Krul', '克鲁尔', 'Tank'),
('lance', 'Lance', '兰斯', 'Tank'),
('lyra', 'Lyra', '莱拉', 'Support'),
('malene', 'Malene', '玛琳', 'Assassin'),
('magnus', 'Magnus', '马格努斯', 'Tank'),
('miko', 'Miko', '米波', 'Support'),
('ox', 'Ozo', '猴子', 'Assassin'),
('peta', 'Petal', '佩塔', 'Assassin'),
('phinn', 'Phinn', '胖子', 'Tank'),
('reim', 'Reim', '雷姆', 'Mage'),
('reza', 'Reza', '雷萨', 'Assassin'),
('ringo', 'Ringo', '酒枪', 'Mage'),
('rona', 'Rona', '罗娜', 'Assassin'),
('samuel', 'Samuel', '塞缪尔', 'Mage'),
('scaarf', 'Scaarf', '沙鸥', 'Mage'),
('seraphine', 'Seraphine', '赛拉菲恩', 'Support'),
('skye', 'Skye', '丝凯', 'Assassin'),
('sorrowblade', 'Sorrowblade', '哀伤之刃', 'Assassin'),
('taka', 'Taka', '塔卡', 'Assassin'),
('varus', 'Varus', '瓦鲁斯', 'Mage'),
('vern', 'Vern', '小精灵', 'Support'),
('vox', 'Vox', '沃克斯', 'Mage'),
('xavier', 'Xavier', '泽维尔', 'Support'),
('yates', 'Yates', '叶茨', 'Support'),
('zarf', 'Zarf', '扎夫', 'Tank')
ON CONFLICT (id) DO NOTHING;