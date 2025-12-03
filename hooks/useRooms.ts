import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';
import { HEROES_DATA, getHeroAvatarUrl } from '../data/heroes';

export interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  bp_updated_at?: string; // BP状态的最新更新时间
  selected_heroes?: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  }>;
  total_selected?: number; // 已选择的英雄数量
  owner?: {
    email: string;
    username?: string;
    display_name?: string;
  };
}



export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [allRoomsLoading, setAllRoomsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [pageSize] = useState(() => {
    // PC端显示10个，移动端显示5个
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 5 : 10;
    }
    return 10; // 默认PC端
  });
  const { user, isConfigured } = useAuth();

  // 请求去重：防止重复请求 (使用 ref 避免依赖循环)
  const isFetchingUserRoomsRef = useRef(false);
  const isFetchingPublicRoomsRef = useRef(false);

  // 统一的房间获取函数，通过 ownerId 筛选
  const fetchRooms = useCallback(async (options?: {
    ownerId?: string;  // 如果提供，只获取该用户的房间；如果不提供，获取所有房间
    page?: number;
  }) => {
    const { ownerId, page = 1 } = options || {};

    if (!isConfigured) {
      setRooms([]);
      setAllRooms([]);
      setTotalRooms(0);
      return;
    }

    // 防止重复请求
    if (isFetchingPublicRoomsRef.current) {
      return;
    }

    isFetchingPublicRoomsRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 构建查询
      let query = supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles(email, username, display_name)
        `);

      // 如果指定了 ownerId，添加筛选条件
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      // 获取总数
      let countQuery = supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      // 如果指定了 ownerId，添加筛选条件
      if (ownerId) {
        countQuery = countQuery.eq('owner_id', ownerId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;

      // 获取分页数据
      let dataQuery = supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(email, username, display_name)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (ownerId) {
        dataQuery = dataQuery.eq('owner_id', ownerId);
      }

      const { data: roomsData, error: roomsError } = await dataQuery;
      if (roomsError) throw roomsError;

      // 根据是否有 ownerId 来更新不同的状态
      if (ownerId) {
        setRooms(roomsData || []);
      } else {
        setAllRooms(roomsData || []);
      }

      setTotalRooms(count || 0);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
      setRooms([]);
      setAllRooms([]);
      setTotalRooms(0);
    } finally {
      setLoading(false);
      isFetchingPublicRoomsRef.current = false;
    }
  }, [isConfigured, pageSize]);

  // 便捷函数：获取用户自己的房间
  const fetchUserRooms = useCallback((page?: number) => {
    if (!user) return;
    return fetchRooms({ ownerId: user.id, page });
  }, [fetchRooms, user]);

  
  
  
  // 删除房间（仅房主）
  const deleteRoom = async (roomId: string) => {
    if (!isConfigured || !user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      // 检查是否为房主
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .eq('owner_id', user.id)
        .single();

      if (roomError || !room) {
        throw new Error('Room not found or not authorized');
      }

      // 删除房间
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('owner_id', user.id);

      if (deleteError) throw deleteError;

      // 刷新房间列表
      await fetchAllRooms(currentPage);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  
  // 便捷函数：获取所有房间
  const fetchAllRooms = useCallback((page?: number) => {
    return fetchRooms({ page });
  }, [fetchRooms]);

  useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms]);



  return {
    rooms,
    allRooms,
    loading,
    allRoomsLoading,
    error,
    currentPage,
    totalRooms,
    pageSize,
    fetchRooms,        // 新增：统一的房间获取函数
    fetchUserRooms,
    fetchAllRooms,
    deleteRoom,
    refetch: fetchUserRooms
  };
};