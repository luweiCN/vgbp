import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';

export interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  owner?: {
    email: string;
    display_name?: string;
  };
  participant_count?: number;
}

export interface RoomSettings {
  search_term: string;
  hide_selected: boolean;
  classification_mode: 'official' | 'common' | 'flex';
  layout_mode: 'auto' | '3' | '4' | '5';
  current_visible_section: 'captain' | 'jungle' | 'carry' | null;
}

export interface RoomParticipant {
  room_id: string;
  user_id: string;
  role: 'owner' | 'participant';
  joined_at: string;
  user?: {
    email: string;
    display_name?: string;
  };
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [participants, setParticipants] = useState<Record<string, RoomParticipant[]>>({});
  const [loading, setLoading] = useState(false);
  const [allRoomsLoading, setAllRoomsLoading] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
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

  // 获取用户参与的房间
  const fetchUserRooms = useCallback(async () => {
    if (!isConfigured || !user) {
      setRooms([]);
      return;
    }

    // 防止重复请求
    if (isFetchingUserRoomsRef.current) {
      return;
    }

    isFetchingUserRoomsRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 先查询用户拥有的房间
      const { data: ownedRooms, error: ownedError } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles(email, display_name)
        `)
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (ownedError) throw ownedError;

      // 再查询用户参与的房间
      const { data: participatedRooms, error: participatedError } = await supabase
        .from('room_participants')
        .select(`
          room_id,
          rooms(
            *,
            owner:profiles(email, display_name)
          )
        `)
        .eq('user_id', user.id)
        .neq('role', 'owner'); // 排除已拥有的房间

      if (participatedError) throw participatedError;

      // 合并结果
      const allRooms = [
        ...(ownedRooms || []),
        ...(participatedRooms?.map(p => p.rooms).flat() || [])
      ];

      // 去重（根据ID）
      const uniqueRooms = allRooms.filter((room, index, arr) =>
        arr.findIndex(r => r.id === room.id) === index
      );

      // 查询每个房间的准确参与者数量
      const roomsWithCounts = await Promise.all(
        uniqueRooms.map(async (room) => {
          const { data: roomParticipants } = await supabase
            .from('room_participants')
            .select('user_id')
            .eq('room_id', room.id);

          return {
            ...room,
            participant_count: roomParticipants?.length || 1
          };
        })
      );

      setRooms(roomsWithCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isFetchingUserRoomsRef.current = false;
    }
  }, [isConfigured, user]);

  // 创建新房间
  const createRoom = async (roomData: {
    name: string;
    description?: string;
  }) => {
    if (!user || !isConfigured) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      const { data, error: createError } = await supabase
        .from('rooms')
        .insert({
          name: roomData.name,
          description: roomData.description,
          owner_id: user.id,
          is_public: true
        })
        .select()
        .single();

      if (createError) throw createError;

      // 创建房间后，添加房主为参与者
      await supabase
        .from('room_participants')
        .insert({
          room_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      // 创建房间设置
      await supabase
        .from('room_settings')
        .insert({
          room_id: data.id
        });

      // 刷新房间列表
      await fetchUserRooms();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 加入房间
  const joinRoom = async (roomId: string) => {
    if (!isConfigured || !user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      // 检查房间是否存在且公开
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .eq('is_public', true)
        .single();

      if (roomError || !room) {
        throw new Error('Room not found or not public');
      }

      // 检查是否已加入
      const { data: participant } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (participant) {
        throw new Error('Already a member of this room');
      }

      // 加入房间
      const { error: joinError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'participant'
        });

      if (joinError) throw joinError;

      // 刷新房间列表
      await fetchUserRooms();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 离开房间
  const leaveRoom = async (roomId: string) => {
    if (!isConfigured || !user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      // 刷新房间列表
      await fetchUserRooms();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

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

      // 删除房间（级联删除相关数据）
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('owner_id', user.id);

      if (deleteError) throw deleteError;

      // 刷新房间列表
      await fetchUserRooms();
      await fetchAllRooms(currentPage);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  // 获取所有房间（分页）
  const fetchAllRooms = useCallback(async (page: number = 1) => {
    if (!isConfigured) {
      setAllRooms([]);
      setTotalRooms(0);
      return;
    }

    // 防止重复请求
    if (isFetchingPublicRoomsRef.current) {
      return;
    }

    isFetchingPublicRoomsRef.current = true;
    setAllRoomsLoading(true);
    setError(null);

    try {
      // 先获取总数
      const { count, error: countError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // 获取分页数据
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (roomsError) throw roomsError;

      // 获取创建者信息
      const roomsWithOwners = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', room.owner_id)
            .single();

          return {
            ...room,
            owner: ownerData
          };
        })
      );

      setAllRooms(roomsWithOwners);
      setTotalRooms(count || 0);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
      setAllRooms([]);
      setTotalRooms(0);
    } finally {
      setAllRoomsLoading(false);
      isFetchingPublicRoomsRef.current = false;
    }
  }, [isConfigured, pageSize]);

  useEffect(() => {
    fetchUserRooms();
    fetchAllRooms();
  }, [fetchUserRooms, fetchAllRooms]);



  return {
    rooms,
    allRooms,
    loading,
    allRoomsLoading,
    error,
    currentPage,
    totalRooms,
    pageSize,
    fetchUserRooms,
    fetchAllRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    refetch: fetchUserRooms
  };
};