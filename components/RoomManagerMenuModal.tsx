import React from 'react';
import { X, User, Edit, LogOut, LogIn, ArrowUpRight, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Icon } from '@/components/ui/Icon';

interface RoomManagerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenUserSettings: () => void;
  onOpenLogin: () => void;
}

export const RoomManagerMenuModal: React.FC<RoomManagerMenuModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  onOpenUserSettings,
  onOpenLogin,
}) => {
  const { user, signOut } = useAuth();
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* 菜单面板 */}
      <div className="fixed right-0 top-0 h-full w-72 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          {/* 菜单头部 */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white">{t('ui.components.roomManagerMenu.title')}</h3>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Icon icon={X} preset="sm" />
            </button>
          </div>

          {/* 菜单内容 */}
          <div className="space-y-4">
            {/* 用户信息显示 */}
            <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {user.username}
                      </div>
                      <div className="text-zinc-400 text-sm truncate">
                        {user.email}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      <Icon icon={User} preset="md" className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {t('ui.components.roomManagerMenu.guest.mode')}
                      </div>
                      <div className="text-zinc-400 text-sm truncate">
                        {t('ui.components.roomManagerMenu.guest.description')}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 用户操作区域 */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('ui.components.roomManagerMenu.sections.user')}
              </h4>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onOpenUserSettings();
                      onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Icon icon={Edit} preset="xs" className="text-white" />
                    </div>
                    <div>
                      <div className="text-white">{t('ui.components.roomManagerMenu.userSettings.settings')}</div>
                      <div className="text-xs text-zinc-500">
                        {t('ui.components.roomManagerMenu.userSettings.settingsDescription')}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                        onClose();
                      } catch (error) {
                        console.error('Sign out failed:', error);
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Icon icon={LogOut} preset="xs" className="text-white" />
                    </div>
                    <div>
                      <div className="text-white">{t('ui.components.roomManagerMenu.userSettings.signOut')}</div>
                      <div className="text-xs text-zinc-500">
                        {t('ui.components.roomManagerMenu.userSettings.signOutDescription')}
                      </div>
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon icon={LogIn} preset="xs" className="text-white" />
                  </div>
                  <div>
                    <div>{t('ui.components.roomManagerMenu.auth.loginOrRegister')}</div>
                    <div className="text-xs text-blue-100">
                      {t('ui.components.roomManagerMenu.auth.accessFullFeatures')}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* 房间操作区域 - 所有用户都可见 */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('ui.components.roomManagerMenu.sections.rooms')}
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onJoinRoom();
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon icon={ArrowUpRight} preset="sm" className="text-white" />
                </div>
                <div>
                  <div>{t('ui.components.roomManagerMenu.roomActions.join')}</div>
                  <div className="text-xs text-purple-100">
                    {t('ui.components.roomManagerMenu.roomActions.joinDescription')}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onCreateRoom();
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon icon={Plus} preset="xs" className="text-white" />
                </div>
                <div>
                  <div>{t('ui.components.roomManagerMenu.roomActions.create')}</div>
                  <div className="text-xs text-green-100">
                    {user ? t('ui.components.roomManagerMenu.roomActions.createDescription') : t('ui.components.roomManagerMenu.roomActions.createDescriptionForGuest')}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};