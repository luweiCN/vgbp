import React from 'react';
import { User, Info } from 'lucide-react';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Icon } from './ui/Icon';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onUsernameChange: (value: string) => void;
  onUpdateUsername: () => void;
  loading: boolean;
  error?: string;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  username,
  onUsernameChange,
  onUpdateUsername,
  loading,
  error,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{t('ui.components.userSettings.title')}</h3>
            <p className="text-sm text-zinc-400 mt-1">{t('ui.components.userSettings.subtitle')}</p>
          </div>
          <button
            onClick={() => {
              onClose();
              onUsernameChange("");
            }}
            className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {t('ui.components.userSettings.fields.username.label')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon={User} preset="sm" className="text-zinc-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUsernameChange(e.target.value)
                }
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t('ui.components.userSettings.fields.username.placeholder')}
                required
              />
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {t('ui.components.userSettings.fields.username.description')}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
              <div className="flex items-center gap-3">
                <Icon icon={Info} preset="sm" className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onUpdateUsername}
              disabled={loading || !username.trim()}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('ui.components.userSettings.loading')}
                </div>
              ) : (
                t('ui.components.userSettings.buttons.update')
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                onUsernameChange("");
              }}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('ui.components.userSettings.buttons.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};