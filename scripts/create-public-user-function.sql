-- 创建获取公开用户信息的数据库函数
-- 在 Supabase 项目的 SQL 编辑器中执行这些语句

-- 创建或替换函数：获取公开用户信息（不包含邮箱）
CREATE OR REPLACE FUNCTION get_public_user_info(user_id UUID)
RETURNS TABLE (
    username TEXT,
    display_name TEXT,
    email TEXT -- 返回 null 以保持接口一致性
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.username,
        p.display_name,
        NULL::TEXT as email  -- 邮箱设为 null，不对外公开
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为函数添加注释
COMMENT ON FUNCTION get_public_user_info IS '获取用户的公开信息（用户名和显示名称），不包含敏感信息如邮箱';