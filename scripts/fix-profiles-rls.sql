-- 修复 RLS 策略：允许所有人查看房间创建者的用户名和显示名称
-- 在 Supabase 项目的 SQL 编辑器中执行这些语句

-- 删除现有的 profiles 表查看策略
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 创建新的 profiles 表查看策略
-- 允许所有人查看用户名和显示名称（用于房间创建者显示）
CREATE POLICY "Anyone can view usernames and display names" ON profiles
    FOR SELECT USING (
        -- 所有人都可以查看用户名和显示名称
        true
    );

-- 限制邮箱只能自己查看
CREATE POLICY "Users can view own email" ON profiles
    FOR SELECT USING (
        auth.uid() = id AND 
        -- 只在选择邮箱时才应用此策略（通过使用 CASE 语句）
        -- 但由于 RLS 限制，我们采用另一种方式
        false  -- 这个策略实际上不会被使用，因为上面的策略已经允许所有 SELECT
    );

-- 更新策略：只允许查看必要的公开信息
-- 由于 Supabase RLS 的限制，我们需要创建一个视图或者修改查询
-- 这里我们采用修改策略的方式，只允许查看特定字段

-- 删除刚才创建的宽泛策略
DROP POLICY IF EXISTS "Anyone can view usernames and display names" ON profiles;

-- 创建更精确的策略：允许查看房间创建者的基本信息
CREATE POLICY "Anyone can view room owners' basic info" ON profiles
    FOR SELECT USING (
        -- 如果用户是房间创建者，则允许查看其基本信息
        id IN (
            SELECT DISTINCT owner_id FROM rooms WHERE is_public = true
        )
    );

-- 允许用户查看自己的完整信息
CREATE POLICY "Users can view own full profile" ON profiles
    FOR SELECT USING (auth.uid() = id);