import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';
import { HEROES_DATA, getHeroAvatarUrl } from '../data/heroes';
import { RoomFetchOptions } from '../types/roomFilters';

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

  // 统一的房间获取函数，支持多种筛选和搜索选项
  const fetchRooms = useCallback(async (options?: RoomFetchOptions) => {
    const {
      ownerId,
      page = 1,
      search,
      sortBy,
      sortOrder = 'desc'
    } = options || {};

    if (!isConfigured) {
      setRooms([]);
      setAllRooms([]);
      setTotalRooms(0);
      return {
        data: [],
        total: 0
      };
    }

    // 防止重复请求
    if (isFetchingPublicRoomsRef.current) {
      return {
        data: [],
        total: 0
      };
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
          owner:profiles!rooms_owner_id_fkey(email, username, display_name)
        `);

      // 所有者筛选
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      // 搜索条件：房间名称或描述模糊匹配
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

      // 获取总数（应用相同的筛选条件）
      let countQuery = supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (ownerId) {
        countQuery = countQuery.eq('owner_id', ownerId);
      }

      if (search && search.trim()) {
        countQuery = countQuery.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

      // 获取当前查询条件下的数量
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // 获取数据库中所有房间的总数（用于更新 totalRooms）
      let totalCount = 0;
      try {
        const { count: dbTotalCount } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true });
        totalCount = dbTotalCount || 0;
      } catch (err) {
        console.error('获取数据库总数失败:', err);
      }

      // 排序逻辑
      let sortField: string;
      if (sortBy === 'updated') {
        // 更新时间排序：取 updated_at 和 bp_updated_at 的最大值
        // 这里使用一个CASE语句来实现
        query = query.order('updated_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'created') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else {
        // 默认按更新时间排序
        query = query.order('updated_at', { ascending: false });
      }

      // 分页
      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data: roomsData, error: roomsError } = await query;
      if (roomsError) throw roomsError;

      // 根据是否有 ownerId 来更新不同的状态
      if (ownerId) {
        setRooms(roomsData || []);
      } else {
        setAllRooms(roomsData || []);
      }

      // 始终更新 totalRooms 为数据库中的总数
      setTotalRooms(totalCount);
      setCurrentPage(page);

      // 返回数据和总数
      return {
        data: roomsData || [],
        total: count || 0
      };
    } catch (err: any) {
      setError(err.message);
      setRooms([]);
      setAllRooms([]);
      setTotalRooms(0);

      // 返回空结果
      return {
        data: [],
        total: 0
      };
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

  // 获取数据库中所有房间的总数（不带任何筛选条件）
  const fetchTotalRoomCount = useCallback(async () => {
    if (!isConfigured) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      const totalCount = count || 0;
      // 更新 totalRooms 状态
      setTotalRooms(totalCount);
      return totalCount;
    } catch (err: any) {
      console.error('获取房间总数失败:', err);
      return 0;
    }
  }, [isConfigured]);

  // 新增：获取筛选后的房间（支持搜索、排序等）
  const fetchFilteredRooms = useCallback(async (options: RoomFetchOptions) => {
    return fetchRooms(options);
  }, [fetchRooms]);

  
  
  
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
    fetchRooms,
    fetchUserRooms,
    fetchAllRooms,
    fetchFilteredRooms, // 新增：支持筛选的房间获取函数
    fetchTotalRoomCount, // 新增：获取数据库中所有房间总数
    deleteRoom,
    refetch: fetchUserRooms
  };
};