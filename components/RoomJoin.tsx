import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useToast } from '../hooks/useToast';

interface RoomJoinProps {
  onRoomJoined: (roomId: string) => void;
  onCancel: () => void;
}

const RoomJoin: React.FC<RoomJoinProps> = ({ onRoomJoined, onCancel }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // 解析输入字符串，提取房间ID
  const parseRoomId = (inputStr: string): string | null => {
    const trimmedInput = inputStr.trim();

    if (!trimmedInput) {
      return null;
    }

    // 先尝试作为链接解析
    try {
      // 如果是链接格式，提取房间ID
      const urlRoomIdMatch = trimmedInput.match(/room[\/=]([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i);
      if (urlRoomIdMatch) {
        return urlRoomIdMatch[1];
      }
    } catch (error) {
      // 如果解析链接失败，继续下一步
    }

    // 如果不是链接，就直接当作房间ID返回
    return trimmedInput;
  };

  // 加入房间
  const handleJoinRoom = async () => {
    const roomId = parseRoomId(input);

    if (!roomId) {
      showError('请输入有效的房间ID或邀请链接');
      return;
    }

    setLoading(true);
    try {
      // 验证房间是否存在
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('id', roomId)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoinRoom();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-auto p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
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

        {/* 内容 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              房间ID或邀请链接
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入房间ID或邀请链接"
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-zinc-500">
              支持格式：房间ID 或包含房间的完整链接
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-zinc-300">正在加入房间...</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              加入房间
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-600 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomJoin;