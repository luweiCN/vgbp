import React from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  roomId: string;
  onRoomIdChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roomId,
  onRoomIdChange,
  loading,
  error,
}) => {
  const { t } = useI18n();
  const getRoomUrl = (roomId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/room/${roomId}`;
    }
    return `http://localhost:3000/room/${roomId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t('ui.components.joinRoom.title')}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {t('ui.components.joinRoom.fields.idOrLink.label')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onRoomIdChange(e.target.value)
                }
                className="w-full px-4 py-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                required
                placeholder={t('ui.components.joinRoom.fields.idOrLink.placeholder')}
              />
              {roomId && (
                <button
                  type="button"
                  onClick={() => onRoomIdChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {t('ui.components.joinRoom.fields.idOrLink.support', { url: getRoomUrl("abc123") })}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !roomId.trim()}
              className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('ui.components.joinRoom.loading')}
                </div>
              ) : (
                t('ui.components.joinRoom.buttons.join')
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('ui.components.joinRoom.buttons.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};