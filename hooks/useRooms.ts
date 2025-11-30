import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isConfigured } = useAuth();

  // 获取用户参与的房间
  const fetchUserRooms = async () => {
    if (!isConfigured || !user) {
      setRooms([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles(email, display_name),
          room_participants!inner(user_id)
        `)
        .or(`owner_id.eq.${user.id},room_participants.user_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // 计算参与者数量
      const roomsWithCounts = (data || []).map(room => ({
        ...room,
        participant_count: Array.isArray(room.room_participants)
          ? room.room_participants.length
          : 1
      }));

      setRooms(roomsWithCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 创建新房间
  const createRoom = async (roomData: {
    name: string;
    description?: string;
    is_public?: boolean;
  }) => {
    if (!isConfigured || !user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      const { data, error: createError } = await supabase
        .from('rooms')
        .insert({
          name: roomData.name,
          description: roomData.description,
          owner_id: user.id,
          is_public: roomData.is_public ?? true
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
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchUserRooms();
  }, [user, isConfigured]);

  return {
    rooms,
    loading,
    error,
    fetchUserRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    refetch: fetchUserRooms
  };
};