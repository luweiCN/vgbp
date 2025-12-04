import React from 'react';
import { User } from '../hooks/useAuth';

interface RoomHeaderProps {
  user: User | null;
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
  return (
    <div className="flex justify-between items-center h-16 sm:h-[70px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* 返回首页按钮 */}
            <button
              onClick={onBack}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors flex-shrink-0"
              title="返回首页"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
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
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="hidden sm:inline">加入房间</span>
            <span className="sm:hidden">加入</span>
          </button>

          <button
            onClick={onCreateRoom}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-1 sm:gap-2"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">创建房间</span>
            <span className="sm:hidden">创建</span>
          </button>
        </div>

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
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <span className="text-white text-sm font-medium hidden sm:inline">
            {user ? user.username : "游客"}
          </span>
          <svg
            className="w-3 h-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};