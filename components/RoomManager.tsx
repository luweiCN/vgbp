import React, { useState } from 'react';
import { useRooms, Room } from '../hooks/useRooms';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { supabase } from '../services/supabase';

interface RoomManagerProps {
  onEnterRoom?: (roomId: string) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ onEnterRoom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [usernameFormData, setUsernameFormData] = useState({
    username: ''
  });
  const [usernameFormLoading, setUsernameFormLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: ''
  });
  const [joinFormData, setJoinFormData] = useState({
    roomId: ''
  });
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, loading: authLoading, signIn, signUp, signOut, updateUsername, isConfigured } = useAuth();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const {
    rooms,
    allRooms,
    loading: roomsLoading,
    allRoomsLoading,
    error: roomsError,
    currentPage,
    totalRooms,
    pageSize,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    fetchAllRooms,
    refetch
  } = useRooms();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查用户是否已登录
    if (!user) {
      setShowLoginForm(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newRoom = await createRoom(createFormData);
      setCreateFormData({ name: '', description: '' });
      setShowCreateForm(false);

      // 创建成功后自动进入房间
      if (newRoom?.id && onEnterRoom) {
        onEnterRoom(newRoom.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinFormData.roomId.trim()) {
      setError('请输入房间ID或房间链接！');
      return;
    }

    setJoinLoading(true);
    setError('');

    try {
      // 提取房间ID（支持直接输入ID或链接）
      let roomId = joinFormData.roomId.trim();
      
      // 如果输入的是链接，提取房间ID
      if (roomId.includes('/room/')) {
        const match = roomId.match(/\/room\/([a-zA-Z0-9_-]+)/);
        if (match) {
          roomId = match[1];
        } else {
          throw new Error('无效的房间链接格式');
        }
      }

      // 检查房间是否存在
      if (!isConfigured) {
        throw new Error('在线功能未配置');
      }

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .eq('is_public', true)
        .single();

      if (roomError || !room) {
        throw new Error('房间不存在');
      }

      // 如果用户已登录，加入房间
      if (user) {
        await joinRoom(roomId);
        showSuccess('成功加入房间！');
      }

      // 进入房间
      setJoinFormData({ roomId: '' });
      setShowJoinForm(false);
      
      if (onEnterRoom) {
        onEnterRoom(roomId);
      }
    } catch (err: any) {
      const errorMessage = err.message || '加入房间失败，请检查房间ID是否正确';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setJoinLoading(false);
    }
  };

   
  const handleLeaveRoom = async (roomId: string) => {
    if (!confirm('确定要离开这个房间吗？')) return;

    try {
      await leaveRoom(roomId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setShowDeleteConfirm(roomId);
  };

  const confirmDeleteRoom = async (roomId: string) => {
    setShowDeleteConfirm(null);
    
    try {
      await deleteRoom(roomId);
      showSuccess('房间删除成功！');
    } catch (err: any) {
      const errorMessage = err.message || '删除房间失败，请稍后重试';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  // 认证处理函数
  const handleAuth = async () => {
    if (authMode === 'register') {
      if (!authFormData.username.trim()) {
        setError('请输入用户名！');
        return;
      }
      
      if (authFormData.password !== authFormData.confirmPassword) {
        setError('两次输入的密码不一致！');
        return;
      }
    }

    if (authFormData.password.length < 6) {
      setError('密码长度至少为6位！');
      return;
    }

    setAuthFormLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await signIn(authFormData.email, authFormData.password);
      } else {
        await signUp(authFormData.email, authFormData.password, authFormData.username);
      }
      setAuthFormData({ email: '', password: '', confirmPassword: '', username: '' });
      setShowLoginForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthFormLoading(false);
    }
  };

  // 更新用户名处理函数
  const handleUpdateUsername = async () => {
    if (!usernameFormData.username.trim()) {
      setError('请输入新的用户名！');
      return;
    }

    if (usernameFormData.username === user?.username) {
      setError('新用户名与当前用户名相同！');
      return;
    }

    setUsernameFormLoading(true);
    setError('');

    try {
      await updateUsername(usernameFormData.username);
      setUsernameFormData({ username: '' });
      setShowUserSettings(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUsernameFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  };

  const getRoomUrl = (roomId: string) => {
    return `${getCurrentDomain()}/room/${roomId}`;
  };

  // 公开房间列表已在 useRooms hook 中处理，无需重复调用

  // 认证检查 - 改进加载状态处理
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white">加载用户信息中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-400">在线功能未配置</div>
        </div>
      </div>
    );
  }

  
  // 已登录，显示房间管理界面
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20">
                V
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
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
        
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* 桌面端：显示所有按钮 */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {/* 房间操作按钮 */}
            <button
              onClick={() => setShowJoinForm(true)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">加入房间</span>
              <span className="sm:hidden">加入</span>
            </button>
            
            <button
              onClick={() => {
                if (!user) {
                  setShowLoginForm(true);
                  return;
                }
                const now = new Date();
                const dateStr = now.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '-');
                const timeStr = now.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
                setCreateFormData({
                  name: `${user?.username || ''}的房间 ${dateStr} ${timeStr}`,
                  description: ''
                });
                setShowCreateForm(true);
              }}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">创建房间</span>
              <span className="sm:hidden">创建</span>
            </button>
            
            <button
              onClick={() => fetchAllRooms(currentPage)}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200"
              title="刷新房间列表"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 用户按钮：未登录显示登录按钮，已登录显示用户头像按钮 */}
            {user ? (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-full cursor-pointer hover:bg-slate-800/80 transition-all duration-200"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></div>
                </div>
                <span className="text-white text-sm font-medium">
                  {user.username}
                </span>
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginForm(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center gap-1 sm:gap-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">登录</span>
                <span className="sm:hidden">登录</span>
              </button>
            )}
          </div>

          {/* 移动端：右侧按钮组 */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* 移动端：刷新按钮 */}
            <button
              onClick={() => fetchAllRooms(currentPage)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all duration-200"
              title="刷新房间列表"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 移动端：用户按钮 */}
            {user ? (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-full cursor-pointer hover:bg-slate-800/80 transition-all duration-200"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></div>
                </div>
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginForm(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all duration-200"
                title="登录"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>



      {/* 创建房间弹窗 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">创建新房间</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({ name: '', description: '' });
                  setError('');
                }}
                className="text-zinc-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  房间名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  maxLength={50}
                  placeholder={`${user?.username || ''}的房间 YYYY-MM-DD HH:mm`}
                />
                <div className="mt-1 text-xs text-zinc-500 text-right">
                  {createFormData.name.length}/50
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  房间描述 <span className="text-zinc-500">（可选）</span>
                </label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                  rows={3}
                  maxLength={200}
                  placeholder="输入房间描述（最多200字符）"
                />
                <div className="mt-1 text-xs text-zinc-500 text-right">
                  {createFormData.description.length}/200
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
                  disabled={loading || !createFormData.name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      创建中...
                    </div>
                  ) : (
                    '创建房间'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateFormData({ name: '', description: '' });
                    setError('');
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 加入房间弹窗 */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">加入房间</h2>
              <button
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinFormData({ roomId: '' });
                  setError('');
                }}
                className="text-zinc-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  房间ID或房间链接 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={joinFormData.roomId}
                    onChange={(e) => setJoinFormData({...joinFormData, roomId: e.target.value})}
                    className="w-full px-4 py-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                    placeholder="输入房间ID或房间链接"
                  />
                  {joinFormData.roomId && (
                    <button
                      type="button"
                      onClick={() => setJoinFormData({...joinFormData, roomId: ''})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  支持输入房间ID或完整的房间链接（如：{getRoomUrl('abc123')}）
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={joinLoading || !joinFormData.roomId.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joinLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      加入中...
                    </div>
                  ) : (
                    '进入房间'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setJoinFormData({ roomId: '' });
                    setError('');
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 移动端侧边菜单 */}
      {showMobileMenu && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* 菜单面板 */}
          <div className="fixed right-0 top-0 h-full w-72 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* 菜单头部 */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-white">用户菜单</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 菜单内容 */}
              <div className="space-y-4">
                {/* 用户信息显示 */}
                {user && (
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{user.username}</div>
                        <div className="text-zinc-400 text-sm truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 用户操作区域 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">用户操作</h4>
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setUsernameFormData({ username: user.username });
                          setShowUserSettings(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white">用户设置</div>
                          <div className="text-xs text-zinc-500">修改用户名</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          signOut();
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white">退出登录</div>
                          <div className="text-xs text-zinc-500">安全退出</div>
                        </div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginForm(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div>
                        <div>登录或注册</div>
                        <div className="text-xs text-blue-100">访问完整功能</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* 移动端房间操作区域 */}
                <div className="sm:hidden space-y-3">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">房间操作</h4>
                  
                  <button
                    onClick={() => {
                      setShowJoinForm(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <div>加入房间</div>
                      <div className="text-xs text-purple-100">通过ID或链接加入</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowLoginForm(true);
                        setShowMobileMenu(false);
                        return;
                      }
                      const now = new Date();
                      const dateStr = now.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '-');
                      const timeStr = now.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                      setCreateFormData({
                        name: `${user?.username || ''}的房间 ${dateStr} ${timeStr}`,
                        description: ''
                      });
                      setShowCreateForm(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <div>创建房间</div>
                      <div className="text-xs text-green-100">创建新的房间</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 房间列表 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            房间列表
          </h2>
          <div className="text-sm text-gray-400">
            共 {totalRooms} 个房间
          </div>
        </div>

        {allRoomsLoading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : allRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            暂时没有公开房间，登录后可以创建自己的房间！
          </div>
        ) : (
          <>
            {/* 桌面端：列表式布局 */}
            <div className="hidden sm:block">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
                {allRooms.map((room, index) => (
                  <div 
                    key={room.id} 
                    className={`group hover:bg-gray-700/30 transition-all duration-200 ${
                      index !== allRooms.length - 1 ? 'border-b border-gray-700' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* 左侧：房间信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                              {room.name}
                            </h3>
                            {room.description && (
                              <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full truncate max-w-xs">
                                {room.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {room.owner?.display_name || room.owner?.email || '未知用户'}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDate(room.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* 右侧：操作按钮 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* 删除按钮 - 第一个 */}
                          {user && room.owner_id === user.id && (
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                              title="删除房间"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          
                          {/* 复制链接按钮 - 第二个 */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(getRoomUrl(room.id));
                              showSuccess('房间链接已复制到剪贴板！');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center gap-1"
                            title="复制链接"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            复制链接
                          </button>
                          
                          {/* 进入房间按钮 - 最后一个 */}
                          <button
                            onClick={() => onEnterRoom?.(room.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            进入房间
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 移动端：紧凑卡片布局 */}
            <div className="sm:hidden space-y-3">
              {allRooms.map((room) => (
                <div key={room.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 relative">
                  {/* 右上角删除按钮 */}
                  {user && room.owner_id === user.id && (
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-md transition-colors"
                      title="删除房间"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-white mb-1 pr-10">{room.name}</h3>
                    {room.description && (
                      <p className="text-xs text-gray-400">{room.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {room.owner?.display_name || room.owner?.email || '未知用户'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(room.created_at)}
                    </span>
                  </div>

                  {/* 底部两个固定按钮 */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onEnterRoom?.(room.id)}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      进入房间
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getRoomUrl(room.id));
                        showSuccess('房间链接已复制到剪贴板！');
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500 rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      复制链接
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页组件 */}
            {totalRooms > pageSize && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => fetchAllRooms(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    第 {currentPage} 页，共 {Math.ceil(totalRooms / pageSize)} 页
                  </span>
                </div>
                
                <button
                  onClick={() => fetchAllRooms(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalRooms / pageSize)}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 登录模态框 */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {authMode === 'login' ? '登录账户' : '注册账户'}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  {authMode === 'login' ? '登录后即可创建和管理房间' : '创建账户开始使用在线功能'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLoginForm(false);
                  setAuthFormData({ email: '', password: '', confirmPassword: '', username: '' });
                  setError('');
                }}
                className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
              >
                ×
              </button>
            </div>

            {/* 模式切换 */}
            <div className="flex bg-zinc-700/50 rounded-lg p-1 mb-6 border border-zinc-600">
              <button
                onClick={() => setAuthMode('login')}
                className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
                  authMode === 'login'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-600"
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
                  authMode === 'register'
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-600"
                }`}
              >
                注册
              </button>
            </div>

            {/* 登录表单 */}
            <div className="space-y-5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    用户名 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={authFormData.username}
                      onChange={(e) => setAuthFormData({...authFormData, username: e.target.value})}
                      className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="请输入用户名（中英文均可）"
                      required
                    />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    用户名将作为您在平台上的显示名称
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  邮箱地址 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={authFormData.email}
                    onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入邮箱地址（用于登录）"
                    required
                  />
                </div>
                {authMode === 'register' && (
                  <div className="mt-1 text-xs text-zinc-500">
                    邮箱地址仅用于登录，不会公开显示
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  密码 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={authFormData.password}
                    onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入密码（至少6位）"
                    required
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    确认密码 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={authFormData.confirmPassword}
                      onChange={(e) => setAuthFormData({...authFormData, confirmPassword: e.target.value})}
                      className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="请再次输入密码"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-400 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAuth}
                disabled={authFormLoading || !authFormData.email || !authFormData.password}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                }`}
              >
                {authFormLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {authMode === 'login' ? '登录中...' : '注册中...'}
                  </>
                ) : (
                  <>
                    {authMode === 'login' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        登录
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        注册
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-700">
              <div className="text-center">
                <p className="text-xs text-zinc-500">
                  {authMode === 'login' ? (
                    <>
                      还没有账户？{' '}
                      <button
                        onClick={() => setAuthMode('register')}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        立即注册
                      </button>
                    </>
                  ) : (
                    <>
                      已有账户？{' '}
                      <button
                        onClick={() => setAuthMode('login')}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        立即登录
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用户设置模态框 */}
      {showUserSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">用户设置</h3>
                <p className="text-sm text-zinc-400 mt-1">修改您的用户名</p>
              </div>
              <button
                onClick={() => {
                  setShowUserSettings(false);
                  setUsernameFormData({ username: '' });
                  setError('');
                }}
                className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  当前用户名
                </label>
                <div className="px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-zinc-300">
                  {user?.username}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  新用户名 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={usernameFormData.username}
                    onChange={(e) => setUsernameFormData({...usernameFormData, username: e.target.value})}
                    className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="请输入新的用户名（中英文均可）"
                    required
                  />
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  用户名将作为您在平台上的显示名称
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-400 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateUsername}
                  disabled={usernameFormLoading || !usernameFormData.username.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {usernameFormLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      更新中...
                    </div>
                  ) : (
                    '更新用户名'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowUserSettings(false);
                    setUsernameFormData({ username: '' });
                    setError('');
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">删除房间</h3>
                <p className="text-sm text-zinc-400 mt-1">此操作不可恢复，请谨慎操作</p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setError('');
                }}
                className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium">确定要删除这个房间吗？</p>
                  <p className="text-red-300 text-sm mt-1">删除后将无法恢复，所有相关数据都会被清除</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => confirmDeleteRoom(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                确认删除
              </button>
               <button
                 onClick={() => {
                   setShowDeleteConfirm(null);
                   setError('');
                 }}
                 className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
               >
                 取消
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};