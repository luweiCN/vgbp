import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Icon } from './ui/Icon';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  roomName,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{t('ui.components.deleteConfirm.title')}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {t('ui.components.deleteConfirm.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon icon={AlertTriangle} preset="md" className="text-red-400 shrink-0" />
            <div>
              <p className="text-red-400 font-medium">
                {t('ui.components.deleteConfirm.mainQuestion')}
              </p>
              <p className="text-red-300 text-sm mt-1">
                {t('ui.components.deleteConfirm.warning')}
              </p>
              {roomName && (
                <p className="text-red-200 text-xs mt-2">
                  {t('ui.components.deleteConfirm.roomName', { roomName: roomName })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <Icon icon={Trash2} preset="xs" />
            {t('ui.components.deleteConfirm.buttons.confirm')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('ui.components.deleteConfirm.buttons.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};