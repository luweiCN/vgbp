import React, { useState } from 'react';
import { RoomManager } from './RoomManager';
import RoomJoin from './RoomJoin';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';

interface EntryPageProps {
  onLocalMode: () => void;
  onOnlineMode: () => void;
  onEnterRoom: (roomId: string) => void;
}

const EntryPage: React.FC<EntryPageProps> = ({ onLocalMode, onOnlineMode, onEnterRoom }) => {
  const { showError, toasts, removeToast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAuthSubmit = (email: string, password: string, confirmPassword?: string) => {
    if (authMode === 'register' && password !== confirmPassword) {
      showError('两次输入的密码不一致！');
      return;
    }

    if (authMode === 'register' && password.length < 6) {
      showError('密码长度至少为6位！');
      return;
    }

    console.log(`${authMode === 'login' ? 'Login' : 'Register'}:`, { email, password });
    // TODO: 这里应该调用实际的认证逻辑
    // 暂时模拟成功
    setShowAuthModal(false);
    setShowRoomManager(true);
  };

  
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 mx-auto mb-4">
            V
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
            Vainglory BP
          </h1>
          <p className="text-zinc-400 text-lg">
            Tactical Draft Assistant
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Local Mode Card */}
          <div
            onClick={onLocalMode}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 cursor-pointer hover:bg-zinc-900/80 hover:border-green-600/50 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-400 mb-2">本地模式</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                立即使用本地存储的英雄选择功能，无需注册登录，所有数据保存在浏览器本地
              </p>
              <div className="mt-4 text-xs text-zinc-500">
                • 即开即用 • 无需登录 • 离线可用 • 数据本地存储
              </div>
            </div>
          </div>

          {/* Online Mode Card */}
          <div
            onClick={onOnlineMode}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 cursor-pointer hover:bg-zinc-900/80 hover:border-blue-600/50 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-blue-400 mb-2">在线模式</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                浏览公开房间列表，创建自己的房间或加入他人房间，支持数据云端存储和共享
              </p>
              <div className="mt-4 text-xs text-zinc-500">
                • 房间管理 • 数据存储 • 云端同步 • 多人使用
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            选择本地模式快速开始，或进入在线模式体验云端房间功能
          </p>
        </div>

        {/* Room Manager Overlay */}
        {showRoomManager && (
          <div className="fixed inset-0 bg-zinc-950 z-[80] overflow-y-auto">
            <div className="min-h-screen">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-4 z-[81]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-white">在线房间</h1>
                  <button
                    onClick={() => setShowRoomManager(false)}
                    className="text-zinc-400 hover:text-white text-2xl px-3 py-1 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    ← 返回
                  </button>
                </div>
              </div>

              {/* Room Manager Content */}
              <div className="p-4">
                <RoomManager onEnterRoom={onEnterRoom} />
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">开始使用在线模式</h3>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-zinc-800 rounded-full p-1 mb-4">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    authMode === 'login'
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    authMode === 'register'
                      ? "bg-green-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  注册
                </button>
              </div>

              {/* Auth Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">邮箱</label>
                  <input
                    type="email"
                    placeholder="请输入邮箱地址"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码（至少6位）"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">确认密码</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="请再次输入密码"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
                    const passwordInputs = document.querySelectorAll('input[type="password"], input[type="text"]');
                    const password = (passwordInputs[0] as HTMLInputElement)?.value;
                    const confirmPassword = authMode === 'register' ? (passwordInputs[1] as HTMLInputElement)?.value : undefined;

                    if (email && password) {
                      handleAuthSubmit(email, password, confirmPassword);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  {authMode === 'login' ? '登录' : '注册'}
                </button>
              </div>

              <div className="text-xs text-zinc-500 text-center pt-2">
                在线模式正在开发中，敬请期待
              </div>
            </div>
          </div>
        )}

        {/* Room Join Modal */}
        {showJoinRoomModal && (
          <RoomJoin
            onRoomJoined={(roomId) => {
              setShowJoinRoomModal(false);
              onEnterRoom(roomId);
            }}
            onCancel={() => setShowJoinRoomModal(false)}
          />
        )}

        {/* Toast Container */}
        <ToastContainer
          toasts={toasts}
          onRemove={removeToast}
        />
      </div>
    </div>
  );
};

export default EntryPage;