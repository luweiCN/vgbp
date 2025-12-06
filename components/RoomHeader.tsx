import React from 'react';
import { ArrowLeft, ArrowUpRight, Plus, User, Menu } from 'lucide-react';
import { AuthUser } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/hooks/useI18n';
import { LanguageToggle } from '@/i18n/components/LanguageSelector';
import { Icon } from '@/components/ui/Icon';

interface RoomHeaderProps {
  user: AuthUser | null;
  onBack?: () => void;
  onJoinRoom: () => void;
  onCreateRoom: () => void;
  onUserMenuToggle: () => void;
  showMobileMenu: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  user,
  onBack,
  onJoinRoom,
  onCreateRoom,
  onUserMenuToggle,
  showMobileMenu,
}) => {
  const { t } = useI18n();
  return (
    <div className="flex justify-between items-center h-16 sm:h-[70px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* 返回首页按钮 */}
            <button
              onClick={onBack}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors flex-shrink-0"
              title={t('ui.components.roomManager.header.backToHome')}
            >
              <Icon icon={ArrowLeft} preset="sm" />
            </button>

            <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/20">
              V
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex-shrink-0">
                  Vainglory BP
                </h1>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
                Tactical Draft Tool
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* 左侧：操作按钮 - 移动端隐藏 */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onJoinRoom}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-1 sm:gap-2"
          >
            <Icon icon={ArrowUpRight} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('ui.components.roomManager.header.joinRoom')}</span>
            <span className="sm:hidden">{t('ui.components.roomManager.header.joinRoomShort')}</span>
          </button>

          <button
            onClick={onCreateRoom}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-1 sm:gap-2"
          >
            <Icon icon={Plus} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('ui.components.roomManager.header.createRoom')}</span>
            <span className="sm:hidden">{t('ui.components.roomManager.header.createRoomShort')}</span>
          </button>

        </div>

        {/* 语言切换器 */}
        <LanguageToggle className="flex-shrink-0" />

        {/* 右侧：用户信息 */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-full cursor-pointer hover:bg-slate-800/80 transition-all duration-200"
          onClick={onUserMenuToggle}
        >
          <div className="relative">
            {user ? (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></div>
              </>
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Icon icon={User} preset="xs" />
              </div>
            )}
          </div>
          <span className="text-white text-sm font-medium hidden sm:inline">
            {user ? user.username : t('ui.components.roomManager.header.guest')}
          </span>
          <Icon icon={Menu} preset="xs" className="text-slate-400" />
        </div>
      </div>
    </div>
  );
};