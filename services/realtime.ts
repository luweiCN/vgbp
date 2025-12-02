import { supabase, RealtimeChannel } from './supabase';

// 实时订阅事件类型
export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  payload: any;
  timestamp: number;
}

// 实时订阅回调类型
export type RealtimeCallback = (event: RealtimeEvent) => void;

/**
 * 使用现代的 broadcast 方式进行实时订阅 (Supabase v2.86+ 推荐方式)
 */
export const subscribeToBpStates = (roomId: string, callback: RealtimeCallback): (() => void) => {
  const channelName = `room_${roomId}`;

  const channel = supabase
    .channel(channelName)
    .on('broadcast', { event: 'bp_changes' }, (payload: any) => {
      callback({
        type: payload.payload?.type || 'UPDATE',
        table: 'bp_states',
        payload: payload.payload,
        timestamp: Date.now()
      } as RealtimeEvent);
    })
    .subscribe((status: string, err?: any) => {
      if (status === 'SUBSCRIBED') {
        callback({
          type: 'UPDATE',
          table: 'bp_states',
          payload: {
            new: null,
            old: null,
            eventType: 'BROADCAST_CONNECTED',
            status: 'connected'
          },
          timestamp: Date.now()
        } as RealtimeEvent);
      }
    });

  // 返回取消订阅函数
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * 广播BP状态变更到指定房间
 */
export const broadcastBPChanges = async (roomId: string, changes: any) => {
  const channelName = `room_${roomId}`;

  const { error } = await supabase
    .channel(channelName)
    .send({
      type: 'broadcast',
      event: 'bp_changes',
      payload: {
        type: 'UPDATE',
        room_id: roomId,
        changes,
        timestamp: Date.now()
      }
    });

  if (error) {
    throw error;
  }
};

/**
 * 轮询作为WebSocket失败时的备用方案
 */
export const subscribeToBpStatesWithPolling = (roomId: string, callback: RealtimeCallback): (() => void) => {
  console.log('🔄 使用轮询模式 - Supabase WebSocket协议不兼容，这是已知的服务端问题');

  // 首先通知切换到轮询模式
  callback({
    type: 'UPDATE',
    table: 'bp_states',
    payload: {
      new: null,
      old: null,
      eventType: 'SWITCHED_TO_POLLING',
      status: 'polling'
    },
    timestamp: Date.now()
  } as RealtimeEvent);

  let lastSyncTime = 0;
  let pollingInterval: NodeJS.Timeout | null = null;

  const loadAndSync = async () => {
    try {
      const { data, error } = await supabase
        .from('bp_states')
        .select('hero_id, is_selected, updated_at')
        .eq('room_id', roomId)
        .eq('is_selected', true);

      if (error) {
        return; // 静默处理错误
      }

      // 轮询成功，先发送连接状态事件
      callback({
        type: 'UPDATE',
        table: 'bp_states',
        payload: {
          new: null,
          old: null,
          eventType: 'POLLING_SUCCESS',
          status: 'connected',
          timestamp: Date.now()
        },
        timestamp: Date.now()
      } as RealtimeEvent);

      // 只有数据有变化时才触发数据变更事件
      const currentSyncTime = data && data.length > 0
        ? Math.max(...data.map(item => new Date(item.updated_at).getTime()))
        : 0;

      if (currentSyncTime > lastSyncTime) {
        callback({
          type: 'UPDATE',
          table: 'bp_states',
          payload: { new: data, old: null, eventType: 'DATA_UPDATE' },
          timestamp: Date.now()
        });
        lastSyncTime = currentSyncTime;
      }
    } catch (error) {
      // 静默处理错误
    }
  };

  // 立即加载
  loadAndSync();

  // 每3秒轮询一次
  pollingInterval = setInterval(loadAndSync, 3000);

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};