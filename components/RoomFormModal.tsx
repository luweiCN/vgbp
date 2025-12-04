import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

interface Room {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
}

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  room?: Room;
  onSuccess?: (message: string, updatedRoom?: Room) => void;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  room,
  onSuccess
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 当模式或房间数据变化时，重置表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && room) {
        // 编辑模式：回填原房间信息
        setFormData({
          name: room.name || '',
          description: room.description || ''
        });
      } else {
        // 创建模式：填入默认房间名
        const defaultName = user?.username
          ? `${user.username}的房间 ${new Date().toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\//g, '-').replace(',', '')}`
          : '';
        setFormData({
          name: defaultName,
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, mode, room, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查用户是否登录
    if (!user) {
      setError('请先登录后再进行操作');
      return;
    }

    // 检查表单数据
    if (!formData.name.trim()) {
      setError('请输入房间名称');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'create') {
        // 创建房间
        const { data: newRoom, error: createError } = await supabase
          .from('rooms')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            owner_id: user.id
          })
          .select()
          .single();

        if (createError) throw createError;

        onSuccess?.('房间创建成功', newRoom);
      } else if (room) {
        // 编辑房间：检查权限
        if (room.owner_id !== user.id) {
          setError('只有房主才能编辑房间信息');
          return;
        }

        // 更新房间
        const { data: updatedRoom, error: updateError } = await supabase
          .from('rooms')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', room.id)
          .eq('owner_id', user.id) // 双重权限验证
          .select()
          .single();

        if (updateError) throw updateError;

        onSuccess?.('房间信息已更新', updatedRoom);
      }

      // 关闭弹窗并重置状态
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError('');
    onClose();
  };

  const getPlaceholder = () => {
    if (mode === 'edit') {
      return '请输入新的房间名称';
    }
    return `${user?.username || ''}的房间 YYYY-MM-DD HH:mm`;
  };

  const getTitle = () => {
    return mode === 'edit' ? '编辑房间' : '创建新房间';
  };

  const getSubmitButtonText = () => {
    return mode === 'edit' ? '保存修改' : '创建房间';
  };

  const getLoadingText = () => {
    return mode === 'edit' ? '保存中...' : '创建中...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              房间名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              maxLength={50}
              placeholder={getPlaceholder()}
            />
            <div className="mt-1 text-xs text-zinc-500 text-right">
              {formData.name.length}/50
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              房间描述 <span className="text-zinc-500">（可选）</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              rows={3}
              maxLength={200}
              placeholder="输入房间描述（最多200字符）"
            />
            <div className="mt-1 text-xs text-zinc-500 text-right">
              {formData.description.length}/200
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {getLoadingText()}
                </div>
              ) : (
                getSubmitButtonText()
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};