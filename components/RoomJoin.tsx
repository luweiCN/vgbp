import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from '../hooks/useToast';

interface Room {
  id: string;
  name: string;
  owner_id: string;
  owner_email?: string;
  is_public: boolean;
  created_at: string;
  participant_count?: number;
}

interface RoomJoinProps {
  onRoomJoined: (roomId: string) => void;
  onCancel: () => void;
}

const RoomJoin: React.FC<RoomJoinProps> = ({ onRoomJoined, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'id' | 'link' | 'public'>('id');
  const [roomId, setRoomId] = useState('');
  const [linkRoomId, setLinkRoomId] = useState('');
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicRoomsLoading, setPublicRoomsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // 加载公开房间列表
  const loadPublicRooms = async () => {
    setPublicRoomsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          owner_id,
          is_public,
          created_at,
          profiles!owner_id (email)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 计算每个房间的参与者数量
      const roomsWithCount = await Promise.all(
        (data || []).map(async (room) => {
          const { count } = await supabase
            .from('room_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);

          return {
            ...room,
            owner_email: room.profiles?.email,
            participant_count: count || 0
          };
        })
      );

      setPublicRooms(roomsWithCount);
    } catch (error: any) {
      showError('加载公开房间失败: ' + error.message);
    } finally {
      setPublicRoomsLoading(false);
    }
  };

  // 切换到公开房间标签时加载数据
  useEffect(() => {
    if (activeTab === 'public') {
      loadPublicRooms();
    }
  }, [activeTab]);

  // 通过房间ID加入
  const handleJoinById = async () => {
    if (!roomId.trim()) {
      showError('请输入房间ID');
      return;
    }

    setLoading(true);
    try {
      // 验证房间是否存在
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('id', roomId.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          showError('房间不存在');
        } else {
          throw error;
        }
        return;
      }

      showSuccess(`成功加入房间: ${room.name}`);
      onRoomJoined(room.id);
    } catch (error: any) {
      showError('加入房间失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 通过邀请链接加入
  const handleJoinByLink = async () => {
    if (!linkRoomId.trim()) {
      showError('请输入邀请链接');
      return;
    }

    // 从链接中提取房间ID
    const roomIdMatch = linkRoomId.match(/room\/([a-f0-9-]+)/);
    if (!roomIdMatch) {
      showError('无效的邀请链接');
      return;
    }

    const extractedRoomId = roomIdMatch[1];
    setLoading(true);
    try {
      // 验证房间是否存在
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('id', extractedRoomId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          showError('房间不存在或已被删除');
        } else {
          throw error;
        }
        return;
      }

      showSuccess(`成功加入房间: ${room.name}`);
      onRoomJoined(room.id);
    } catch (error: any) {
      showError('加入房间失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 从公开房间列表加入
  const handleJoinPublicRoom = async (room: Room) => {
    setLoading(true);
    try {
      showSuccess(`成功加入房间: ${room.name}`);
      onRoomJoined(room.id);
    } catch (error: any) {
      showError('加入房间失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 生成邀请链接
  const generateInviteLink = (roomId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?room=${roomId}`;
  };

  // 复制邀请链接
  const copyInviteLink = (roomId: string) => {
    const link = generateInviteLink(roomId);
    navigator.clipboard.writeText(link).then(() => {
      showSuccess('邀请链接已复制到剪贴板');
    }).catch(() => {
      showError('复制失败，请手动复制链接');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">加入房间</h2>
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('id')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'id'
                ? 'text-blue-400 bg-zinc-700 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            房间ID加入
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-blue-400 bg-zinc-700 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            邀请链接加入
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'public'
                ? 'text-blue-400 bg-zinc-700 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            公开房间
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 房间ID加入 */}
          {activeTab === 'id' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  房间ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="请输入房间ID（如：123e4567-e89b-12d3-a456-426614174000）"
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleJoinById}
                  disabled={loading || !roomId.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '加入中...' : '加入房间'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-zinc-600 text-white py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 邀请链接加入 */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  邀请链接
                </label>
                <textarea
                  value={linkRoomId}
                  onChange={(e) => setLinkRoomId(e.target.value)}
                  placeholder="请粘贴邀请链接（如：https://example.com?room=123e4567-e89b-12d3-a456-426614174000）"
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleJoinByLink}
                  disabled={loading || !linkRoomId.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '加入中...' : '加入房间'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-zinc-600 text-white py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 公开房间列表 */}
          {activeTab === 'public' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">公开房间列表</h3>
                <button
                  onClick={loadPublicRooms}
                  disabled={publicRoomsLoading}
                  className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                >
                  {publicRoomsLoading ? '刷新中...' : '刷新'}
                </button>
              </div>

              {publicRoomsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : publicRooms.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p>暂无公开房间</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {publicRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-zinc-700 rounded-lg p-4 hover:bg-zinc-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{room.name}</h4>
                          <div className="text-sm text-zinc-400 space-y-1">
                            <p>房主: {room.owner_email?.split('@')[0] || '未知'}</p>
                            <p>参与者: {room.participant_count || 0} 人</p>
                            <p>创建时间: {new Date(room.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyInviteLink(room.id)}
                            className="px-3 py-1 bg-zinc-600 text-zinc-300 text-sm rounded hover:bg-zinc-500 transition-colors"
                          >
                            复制链接
                          </button>
                          <button
                            onClick={() => handleJoinPublicRoom(room)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            加入
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;