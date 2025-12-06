import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/hooks/useI18n';
import { supabase } from '@/services/supabase';
import { Icon } from './ui/Icon';

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
  const { t } = useI18n();

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
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${month}-${day} ${hours}:${minutes}`;

        const defaultName = user?.username ? t('ui.components.roomForm.fields.name.placeholder.create', {
          username: user.username
        }) : '';

        // 替换时间占位符
        const finalDefaultName = defaultName.replace('MM-DD HH:mm', timeStr);
        setFormData({
          name: finalDefaultName,
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
      setError(t('ui.components.roomForm.errors.loginRequired'));
      return;
    }

    // 检查表单数据
    if (!formData.name.trim()) {
      setError(t('ui.components.roomForm.errors.nameRequired'));
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

        onSuccess?.(t('ui.components.roomForm.success.create'), newRoom);
      } else if (room) {
        // 编辑房间：检查权限
        if (room.owner_id !== user.id) {
          setError(t('ui.components.roomForm.errors.permissionDenied'));
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

        onSuccess?.(t('ui.components.roomForm.success.update'), updatedRoom);
      }

      // 关闭弹窗并重置状态
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || t('ui.components.roomForm.errors.submitFailed'));
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
      return t('ui.components.roomForm.fields.name.placeholder.edit');
    }
    return t('ui.components.roomForm.fields.name.placeholder.create', { username: user?.username || '' });
  };

  const getTitle = () => {
    return mode === 'edit' ? t('ui.components.roomForm.title.edit') : t('ui.components.roomForm.title.create');
  };

  const getSubmitButtonText = () => {
    return mode === 'edit' ? t('ui.components.roomForm.buttons.save') : t('ui.components.roomForm.buttons.create');
  };

  const getLoadingText = () => {
    return mode === 'edit' ? t('ui.components.roomForm.loading.save') : t('ui.components.roomForm.loading.create');
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
              {t('ui.components.roomForm.fields.name.label')} <span className="text-red-400">*</span>
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
              {t('ui.components.roomForm.fields.description.label')} <span className="text-zinc-500">{t('ui.components.roomForm.fields.description.optional')}</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              rows={3}
              maxLength={200}
              placeholder={t('ui.components.roomForm.fields.description.placeholder')}
            />
            <div className="mt-1 text-xs text-zinc-500 text-right">
              {formData.description.length}/200
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon={Info} preset="sm" className="text-red-400" />
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
              {t('ui.components.roomForm.buttons.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};