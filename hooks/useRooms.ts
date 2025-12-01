import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';
import { HEROES_DATA, getHeroAvatarUrl } from '../data/heroes';

export interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
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
    username?: string;
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
          owner:profiles(email, username, display_name)
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
            owner:profiles(email, username, display_name)
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

      // 获取分页数据，按创建时间排序
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
          let ownerData = null;
          
          try {
            const { data: data, error: ownerError } = await supabase
              .from('profiles')
              .select('email, username, display_name')
              .eq('id', room.owner_id)
              .single();
            
            if (!ownerError && data) {
              ownerData = data;
            } else {
              // 如果查询失败或数据不存在，显示未知用户
              ownerData = {
                username: null,
                display_name: null,
                email: null
              };
            }
          } catch (err) {
            console.warn('Failed to fetch owner data for room:', room.id, err);
            // 查询失败时显示未知用户
            ownerData = {
              username: null,
              display_name: null,
              email: null
            };
          }

          // 获取BP状态信息
          let bpLastUpdated = room.updated_at; // 默认使用房间更新时间
          let selectedHeroes: any[] = [];
          let totalSelected = 0;
          
          try {
            // 获取BP状态的最新更新时间和已选择的英雄
            const { data: bpData, error: bpError } = await supabase
              .from('bp_states')
              .select('hero_id, is_selected, selection_type, updated_at')
              .eq('room_id', room.id)
              .eq('is_selected', true)
              .order('updated_at', { ascending: false });
            
            if (!bpError && bpData) {
              // 获取最新更新时间
              bpLastUpdated = bpData.length > 0 ? bpData[0].updated_at : room.updated_at;
              
              // 统计已选择的英雄
              totalSelected = bpData.length;
              
              // 获取前5个已选择英雄的详细信息
              const heroIds = [...new Set(bpData.map(bp => bp.hero_id))].slice(0, 5);
              
              if (heroIds.length > 0) {
                const OSS_BASE_URL = "https://www.luwei.space:4014/default/vainglory/heroes";
                selectedHeroes = heroIds.map(heroId => {
                  const hero = HEROES_DATA.find(h => h.id === heroId);
                  return {
                    id: heroId,
                    name: hero ? hero.cnName || hero.name : heroId,
                    avatarUrl: hero ? getHeroAvatarUrl(hero, OSS_BASE_URL) : null
                  };
                });
              }
            }
          } catch (err) {
            // 如果没有BP数据，使用默认的房间更新时间
            console.log('No BP data found for room:', room.id);
          }

          // 只有当有选择的英雄时才包含英雄相关字段
          const result: any = {
            ...room,
            owner: ownerData,
            bp_updated_at: bpLastUpdated
          };
          
          if (totalSelected > 0) {
            result.selected_heroes = selectedHeroes;
            result.total_selected = totalSelected;
          }
          
          return result;
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