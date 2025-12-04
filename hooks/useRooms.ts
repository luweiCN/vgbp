import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import { RoomFetchOptions } from '../types/roomFilters';
import { useSearchParams } from 'react-router-dom';

export interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
    selected_heroes?: string[]; // 简化为直接的hero_id数组
  total_selected?: number; // 已选择的英雄数量
  owner?: {
    email: string;
    username?: string;
    display_name?: string;
  };
}



export const useRooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 从URL参数获取当前页码和pageSize
  const getCurrentPagination = useCallback(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlPageSize = parseInt(searchParams.get('pageSize') || '', 10);

    // 默认值：PC端10，移动端5
    const getDefaultPageSize = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 640 ? 5 : 10;
      }
      return 10;
    };

    const currentPage = urlPage > 0 ? urlPage : 1;
    const pageSize = (urlPageSize > 0 && [5, 10, 15, 20].includes(urlPageSize))
      ? urlPageSize
      : getDefaultPageSize();

    return { currentPage, pageSize };
  }, [searchParams]);

  const [totalRooms, setTotalRooms] = useState(0); // 数据库中的房间总数
  const [filteredTotal, setFilteredTotal] = useState(0); // 当前筛选条件下的总数

  
  // 请求序号，用于避免竞态条件
  const requestIdRef = useRef(0);

  // 统一的房间获取函数，支持多种筛选和搜索选项
  const fetchRooms = useCallback(async (options?: RoomFetchOptions & { requestId?: number }) => {
    const { currentPage, pageSize } = getCurrentPagination();

    const {
      ownerId,
      search,
      sortBy,
      sortOrder = 'desc',
      requestId
    } = options || {};

    // 更新请求序号
    if (requestId && requestId > requestIdRef.current) {
      requestIdRef.current = requestId;
    }

  setLoading(true);
  setError(null);

  try {
      // 构建查询 - 简单查询bp_states
      let query = supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(email, username, display_name),
          bp_states!bp_states_room_id_fkey(hero_id, is_selected)
        `);

      // 所有者筛选（用户未登录时忽略此条件）
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      // 搜索条件：房间名称或描述模糊匹配
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

      // 获取当前查询条件下的数量
      let countQuery = supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (ownerId) {
        countQuery = countQuery.eq('owner_id', ownerId);
      }

      if (search && search.trim()) {
        countQuery = countQuery.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

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
      if (sortBy === 'updated') {
        query = query.order('updated_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'created') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else {
        // 默认按更新时间排序
        query = query.order('updated_at', { ascending: false });
      }

      // 分页
      query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      const { data: roomsData, error: roomsError } = await query;
      if (roomsError) throw roomsError;

      // 处理bp_states数据
      const processedRoomsData = roomsData.map(room => {
        const selectedHeroIds = room.bp_states && room.bp_states.length > 0
          ? room.bp_states
              .filter((bpState: any) => bpState.is_selected)
              .map((bpState: any) => bpState.hero_id)
          : [];

        return {
          ...room,
          selected_heroes: selectedHeroIds,
          total_selected: selectedHeroIds.length
        };
      });

      // 竞态条件检查：确保这是最新的请求
      if (requestId && requestId < requestIdRef.current) {
        console.log(`⚠️ useRooms: 请求 ${requestId} 已过期，忽略状态更新 (最新: ${requestIdRef.current})`);
        return {
          data: [],
          total: 0
        };
      }

    // 更新统一的状态
    setRooms(processedRoomsData || []);
    setTotalRooms(totalCount);
    setFilteredTotal(count || 0);

    // 返回数据和总数
    return {
      data: processedRoomsData || [],
      total: count || 0
    };
  } catch (err: any) {
      // 竞态条件检查：确保这是最新的请求
      if (requestId && requestId < requestIdRef.current) {
        console.log(`⚠️ useRooms: 请求 ${requestId} 已过期，忽略错误处理`);
        return {
          data: [],
          total: 0
        };
      }

      setError(err.message);
      setRooms([]);
      setTotalRooms(0);
      setFilteredTotal(0);

      // 返回空结果
      return {
        data: [],
        total: 0
      };
    } finally {
      setLoading(false);
    }
  }, [searchParams, getCurrentPagination]);

  // 智能数据加载函数 - 类似于RoomManager中的loadRoomData
  const loadRoomData = useCallback((filters?: {
    search?: string;
    owner?: string;
    sort?: string;
    order?: string;
    page?: number;
    pageSize?: number;
    t?: number; // 时间戳参数，用于强制刷新
  }) => {
    // 生成新的请求序号
    const currentRequestId = ++requestIdRef.current;

    // 计算有效的owner条件（用户未登录时忽略owner筛选条件）
    const effectiveOwnerId = user && filters?.owner === "me" ? user.id : undefined;

    return fetchRooms({
      ownerId: effectiveOwnerId,
      page: filters?.page,
      search: filters?.search,
      sortBy: filters?.sort,
      sortOrder: filters?.order,
      requestId: currentRequestId,
      pageSize: filters?.pageSize
    });
  }, [user?.id, fetchRooms]);

  // 分页验证函数 - 确保页码有效
  const validatePageNumber = useCallback((currentPage: number, pageSize: number, totalItems: number): number => {
    const totalPages = Math.ceil(totalItems / pageSize);

    // 如果当前页码无效（大于总页数或小于1），重置为1
    if (currentPage < 1 || (totalPages > 0 && currentPage > totalPages)) {
      return 1;
    }

    return currentPage;
  }, []);

  // 删除房间（仅房主）
  const deleteRoom = async (roomId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
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
      await fetchRooms();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  
  


  return {
    rooms,
    loading,
    error,
    totalRooms,
    filteredTotal,
    fetchRooms,
    loadRoomData,
    deleteRoom,
    getCurrentPagination,
    validatePageNumber,
  };
};