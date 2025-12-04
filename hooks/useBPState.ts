import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { subscribeToBpStates, subscribeToBpStatesWithPolling, broadcastBPChanges, RealtimeEvent } from '../services/realtime';
import { useAuth } from './useAuth';

export interface BPState {
  hero_id: string;
  is_selected: boolean;
  selection_type: 'ban' | 'pick';
  updated_at: string;
}

export interface BPStateHook {
  selectedHeroes: Set<string>;
  loading: boolean;
  error: string | null;
  isOnlineMode: boolean;
  canEdit: boolean;  // 新增：是否可编辑权限
  isOwner: boolean;   // 新增：是否是房间创建人
  isRealtimeConnected: boolean; // 新增：实时连接状态
  lastSyncTime: number | null;  // 新增：最后同步时间
  lastSendTime: number | null;  // 新增：最后发送时间
  syncMethod: 'realtime' | 'polling' | 'none'; // 新增：当前同步方式
  toggleHero: (heroId: string) => Promise<void>;
  clearAllHeroes: () => Promise<void>; // 新增：一次性清空所有英雄
  syncToDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

// 本地存储的key
const STORAGE_KEY = 'vainglory-draft-selected-heroes';

export const useBPState = (roomId?: string): BPStateHook => {
  const { user, isConfigured } = useAuth();
  const [selectedHeroes, setSelectedHeroes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomOwner, setRoomOwner] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [lastSendTime, setLastSendTime] = useState<number | null>(null);
  const [syncMethod, setSyncMethod] = useState<'realtime' | 'polling' | 'none'>('none');

  // 用于跟踪实时订阅
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 判断是否为在线模式
  const isOnlineMode = !!roomId;

  // 权限判断：登录用户且是房间创建人才能编辑
  const canEdit = !!(user && roomOwner && user.id === roomOwner);
  const isOwner = !!(user && roomOwner && user.id === roomOwner);

  // 从本地存储加载
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const heroes = JSON.parse(stored);
        setSelectedHeroes(new Set(heroes));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
      setSelectedHeroes(new Set());
    }
  }, []);

  // 从数据库加载
  const loadFromDatabase = useCallback(async () => {
    if (!roomId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 先获取房间信息（用于权限检查）
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single();

      if (roomError && roomError.code !== 'PGRST116') {
        throw roomError;
      }

      // 设置房间创建人
      setRoomOwner(roomData?.owner_id || null);

      // 加载BP状态
      let bpQuery = supabase
        .from('bp_states')
        .select('hero_id, is_selected')
        .eq('room_id', roomId)
        .eq('is_selected', true);

      // 如果房间不存在，抛出错误让App处理（回到入口页）
      if (!roomData) {
        throw new Error('房间不存在');
      }

      const { data, error } = await bpQuery;

      if (error) throw error;

      const heroes = new Set((data || []).map(state => state.hero_id));
      setSelectedHeroes(heroes);

      // 数据库加载成功，更新活动时间和同步方式
      setLastSyncTime(Date.now());
      setSyncMethod('realtime'); // 标记为实时模式（即使后续可能降级到轮询）
    } catch (err: any) {
      setError(err.message || '加载房间数据失败');
      console.error('Failed to load from database:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // 切换英雄选择状态
  const toggleHero = useCallback(async (heroId: string) => {
    // 权限检查：在线模式下非创建人不能编辑
    if (isOnlineMode && !canEdit) {
      setError('只有房间创建人可以编辑英雄选择');
      return;
    }

    const newSelectedHeroes = new Set(selectedHeroes);

    if (newSelectedHeroes.has(heroId)) {
      newSelectedHeroes.delete(heroId);
    } else {
      newSelectedHeroes.add(heroId);
    }

    setSelectedHeroes(newSelectedHeroes);

    // 根据模式同步状态
    if (isOnlineMode) {
      await syncToDatabase(newSelectedHeroes);
    } else {
      saveToLocalStorage(newSelectedHeroes);
    }
  }, [selectedHeroes, isOnlineMode, canEdit, roomId]);

  // 保存到本地存储
  const saveToLocalStorage = useCallback((heroes: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...heroes]));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, []);

  // 同步到数据库
  const syncToDatabase = useCallback(async (heroes?: Set<string>) => {
    const heroesToSync = heroes || selectedHeroes;

    if (!roomId || !user || !isConfigured) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 获取当前数据库中的状态（包括已选择和未选择的）
      const { data: currentStates, error: fetchError } = await supabase
        .from('bp_states')
        .select('hero_id, is_selected')
        .eq('room_id', roomId);

      if (fetchError) throw fetchError;

      // 获取所有已存在的英雄记录
      const currentHeroIds = new Set((currentStates || []).map(state => state.hero_id));
      // 获取当前已选择的英雄
      const currentlySelectedIds = new Set(
        (currentStates || [])
          .filter(state => state.is_selected)
          .map(state => state.hero_id)
      );

      // 计算需要不同操作的英雄
      const toAdd = [...heroesToSync].filter(heroId => !currentHeroIds.has(heroId)); // 全新记录
      // 重新选择的英雄：之前存在但未选择，现在需要选择的英雄
      const toReselect = [...heroesToSync].filter(heroId =>
        currentHeroIds.has(heroId) && !currentlySelectedIds.has(heroId)
      );
      // 取消选择的英雄：当前已选择但不在新选择集中的英雄
      const toUnselect = [...currentlySelectedIds].filter(heroId => !heroesToSync.has(heroId));

      // 如果有任何bp_state变化，同时更新房间的updated_at
      const hasAnyChanges = toUnselect.length > 0 || toReselect.length > 0 || toAdd.length > 0;

      // 批量更新为未选择状态（而不是删除记录）
      if (toUnselect.length > 0) {
        const { error: updateError } = await supabase
          .from('bp_states')
          .update({ is_selected: false })
          .eq('room_id', roomId)
          .in('hero_id', toUnselect);

        if (updateError) throw updateError;
      }

      // 批量更新为已选择状态（重新选择的英雄）
      if (toReselect.length > 0) {
        const { error: reselectError } = await supabase
          .from('bp_states')
          .update({ is_selected: true })
          .eq('room_id', roomId)
          .in('hero_id', toReselect);

        if (reselectError) throw reselectError;
      }

      // 批量添加新记录
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('bp_states')
          .insert(
            toAdd.map(heroId => ({
              room_id: roomId,
              hero_id: heroId,
              is_selected: true,
              selection_type: 'pick'
            }))
          );

        if (insertError) throw insertError;
      }

      // 更新房间的updated_at以反映bp_state变化
      if (hasAnyChanges) {
        const { error: roomUpdateError } = await supabase
          .from('rooms')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', roomId);

        if (roomUpdateError) throw roomUpdateError;
      }

      // 数据库更新成功，广播变更到其他客户端
      try {
        setLastSendTime(Date.now()); // 记录发送时间
        setSyncMethod('realtime'); // 标记为使用实时同步
        await broadcastBPChanges(roomId, {
          type: 'HERO_SELECTION_CHANGED',
          selectedHeroes: [...heroesToSync],
          added: [...toAdd, ...toReselect], // 新增和重新选择的英雄
          removed: toUnselect,
          timestamp: Date.now()
        });
      } catch (broadcastError) {
        // 广播失败，但数据库更新成功，静默处理
        setSyncMethod('none'); // 广播失败，标记为无同步方式
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Failed to sync to database:', err);
      // 同步失败时回退到本地状态
      setSelectedHeroes(selectedHeroes);
    } finally {
      setLoading(false);
    }
  }, [selectedHeroes, roomId, user, isConfigured]);

  // 一次性清空所有英雄
  const clearAllHeroes = useCallback(async () => {
    // 权限检查：在线模式下非创建人不能编辑
    if (isOnlineMode && !canEdit) {
      setError('只有房间创建人可以清空英雄选择');
      return;
    }

    // 清空本地状态
    setSelectedHeroes(new Set());

    // 根据模式同步状态
    if (isOnlineMode) {
      await syncToDatabase(new Set());
    } else {
      saveToLocalStorage(new Set());
    }
  }, [isOnlineMode, canEdit, syncToDatabase, saveToLocalStorage]);

  // 设置实时订阅
  useEffect(() => {
    if (!isOnlineMode) {
      // 本地模式：从localStorage加载
      loadFromLocalStorage();
      setIsRealtimeConnected(false);
      return;
    }

    // 在线模式：从数据库加载并设置实时订阅
    loadFromDatabase();

    // 设置实时订阅，带有自动降级到轮询的功能
    if (roomId) {
      let unsubscribe: (() => void) | null = null;
      let usePolling = false;

      const setupSubscription = (polling: boolean = false) => {
        usePolling = polling;
        setSyncMethod(polling ? 'polling' : 'realtime'); // 设置同步方式

        const subscriptionFn = polling ? subscribeToBpStatesWithPolling : subscribeToBpStates;

        unsubscribe = subscriptionFn(roomId, (event: RealtimeEvent) => {
          console.log('[收到实时事件]', event);

          // 处理Broadcast连接状态
          if (event.payload?.eventType === 'BROADCAST_CONNECTED') {
            console.log('[检测到Broadcast连接成功]');
            setIsRealtimeConnected(true);
            setLastSyncTime(Date.now());
            setSyncMethod('realtime'); // 确保标记为实时模式
            return;
          }

          // 处理WebSocket连接状态 (兼容旧的WEBSOCKET_CONNECTED)
          if (event.payload?.eventType === 'WEBSOCKET_CONNECTED') {
            setIsRealtimeConnected(true);
            setLastSyncTime(Date.now());
            setSyncMethod('realtime'); // 确保标记为实时模式
            return;
          }

          // 处理轮询模式启动
          if (event.payload?.eventType === 'SWITCHED_TO_POLLING') {
            setIsRealtimeConnected(false);
            setLastSyncTime(Date.now());
            setSyncMethod('polling'); // 确保标记为轮询模式
            return;
          }

          // 处理轮询成功事件
          if (event.payload?.eventType === 'POLLING_SUCCESS') {
            setIsRealtimeConnected(false);
            setLastSyncTime(Date.now());
            setSyncMethod('polling'); // 确保标记为轮询模式
            return;
          }

          // 更新同步时间和同步方式
          setLastSyncTime(Date.now());
          if (!polling) {
            setSyncMethod('realtime'); // 非轮询模式就是实时模式
          }

          // 处理Broadcast消息 (新的实时方式)
          if (event.payload?.type === 'HERO_SELECTION_CHANGED') {
            const selectedHeroIds = new Set(event.payload.selectedHeroes || []);
            setSelectedHeroes(selectedHeroIds);
            return;
          }

          // 处理轮询模式：事件包含完整的选中英雄数组
          if (event.payload.new && Array.isArray(event.payload.new)) {
            const selectedHeroIds = new Set(
              event.payload.new
                .filter((item: any) => item.is_selected)
                .map((item: any) => item.hero_id)
            );
            setSelectedHeroes(selectedHeroIds);
            return;
          }

          // WebSocket模式：处理单个事件 (兼容旧的postgres_changes)
          if (event.type === 'INSERT' || event.type === 'UPDATE' || event.type === 'DELETE') {
            // 确保一致性，重新加载完整状态
            loadFromDatabase();
            return;
          }
        });

        unsubscribeRef.current = unsubscribe;
      };

      // 首先尝试WebSocket，如果失败则自动降级到轮询
      setupSubscription(false);

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        setIsRealtimeConnected(false);
      };
    }
  }, [isOnlineMode, roomId, loadFromDatabase, loadFromLocalStorage]);

  return {
    selectedHeroes,
    loading,
    error,
    isOnlineMode,
    canEdit,
    isOwner,
    isRealtimeConnected,
    lastSyncTime,
    lastSendTime,
    syncMethod,
    toggleHero,
    clearAllHeroes,
    syncToDatabase,
    loadFromDatabase
  };
};