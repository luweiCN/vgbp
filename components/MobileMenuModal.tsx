import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenUserSettings: () => void;
  onOpenLogin: () => void;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  onOpenUserSettings,
  onOpenLogin,
}) => {
  const { user } = useAuth();

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
            <h3 className="text-lg font-semibold text-white">用户菜单</h3>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
                      <svg
                        className="w-6 h-6"
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
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        游客模式
                      </div>
                      <div className="text-zinc-400 text-sm truncate">
                        登录后可使用完整功能
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 用户操作区域 */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                用户操作
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
                      <svg
                        className="w-4 h-4 text-white"
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
                    </div>
                    <div>
                      <div className="text-white">用户设置</div>
                      <div className="text-xs text-zinc-500">
                        修改用户名
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      // 这里应该调用 signOut，但为了简化，暂时只关闭菜单
                      onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white">退出登录</div>
                      <div className="text-xs text-zinc-500">
                        安全退出
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
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div>
                    <div>登录或注册</div>
                    <div className="text-xs text-blue-100">
                      访问完整功能
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* 房间操作区域 - 所有用户都可见 */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                房间操作
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onJoinRoom();
                }}
                className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                </div>
                <div>
                  <div>加入房间</div>
                  <div className="text-xs text-purple-100">
                    通过ID或链接加入
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
                  <svg
                    className="w-4 h-4 text-white"
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
                </div>
                <div>
                  <div>创建房间</div>
                  <div className="text-xs text-green-100">
                    {user ? "创建新的房间" : "需要登录后创建"}
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