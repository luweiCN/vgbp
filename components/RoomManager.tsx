import React, { useState } from 'react';
import { useRooms, Room } from '../hooks/useRooms';
import { useAuth } from '../hooks/useAuth';

interface RoomManagerProps {
  onEnterRoom?: (roomId: string) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ onEnterRoom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    is_public: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, loading: authLoading, signIn, signUp, signOut, isConfigured } = useAuth();

  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
    leaveRoom,
    deleteRoom,
    refetch
  } = useRooms();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newRoom = await createRoom(createFormData);
      setCreateFormData({ name: '', description: '', is_public: true });
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

  
  const handleLeaveRoom = async (roomId: string) => {
    if (!confirm('确定要离开这个房间吗？')) return;

    try {
      await leaveRoom(roomId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('确定要删除这个房间吗？此操作不可恢复！')) return;

    try {
      await deleteRoom(roomId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 认证处理函数
  const handleAuth = async () => {
    if (authMode === 'register' && authFormData.password !== authFormData.confirmPassword) {
      setError('两次输入的密码不一致！');
      return;
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
        await signUp(authFormData.email, authFormData.password);
      }
      setAuthFormData({ email: '', password: '', confirmPassword: '' });
      setShowLoginForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthFormLoading(false);
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

  // 认证检查
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-white">加载中...</div>
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

  if (!user) {
    // 显示登录界面
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">我的房间</h1>
        </div>

        <div className="bg-zinc-800 rounded-xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {authMode === 'login' ? '登录' : '注册'}
          </h2>

          {/* 模式切换 */}
          <div className="flex bg-zinc-700 rounded-full p-1 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex-1 ${
                authMode === 'login'
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-600"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex-1 ${
                authMode === 'register'
                  ? "bg-green-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-600"
              }`}
            >
              注册
            </button>
          </div>

          {/* 登录表单 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">邮箱</label>
              <input
                type="email"
                value={authFormData.email}
                onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">密码</label>
              <input
                type="password"
                value={authFormData.password}
                onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码（至少6位）"
                required
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">确认密码</label>
                <input
                  type="password"
                  value={authFormData.confirmPassword}
                  onChange={(e) => setAuthFormData({...authFormData, confirmPassword: e.target.value})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authFormLoading || !authFormData.email || !authFormData.password}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              {authFormLoading
                ? (authMode === 'login' ? '登录中...' : '注册中...')
                : (authMode === 'login' ? '登录' : '注册')
              }
            </button>
          </div>

          <div className="text-xs text-zinc-500 text-center mt-4 pt-4 border-t border-zinc-700">
            登录后即可创建和管理房间
          </div>
        </div>
      </div>
    );
  }

  // 已登录，显示房间管理界面
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">我的房间</h1>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm">
            欢迎, {user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            退出登录
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showCreateForm ? '取消创建' : '创建房间'}
          </button>
          <button
            onClick={refetch}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            刷新
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
          {error}
        </div>
      )}

      {/* 创建房间表单 */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">创建新房间</h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                房间名称
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={50}
                placeholder="输入房间名称（最多50字符）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                房间描述（可选）
              </label>
              <textarea
                value={createFormData.description}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={200}
                placeholder="输入房间描述（最多200字符）"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={createFormData.is_public}
                onChange={(e) => setCreateFormData({...createFormData, is_public: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
              />
              <label htmlFor="is_public" className="ml-2 text-sm text-gray-300">
                公开房间（其他人可以通过ID加入）
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !createFormData.name.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '创建中...' : '创建房间'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      
      {/* 房间列表 */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">我的房间</h2>

        {roomsLoading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            还没有加入任何房间，创建或加入一个开始协作吧！
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
                    {room.description && (
                      <p className="text-gray-400 mb-2">{room.description}</p>
                    )}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>创建者：{room.owner?.email}</p>
                      <p>参与者：{room.participant_count || 1} 人</p>
                      <p>创建时间：{formatDate(room.created_at)}</p>
                      <p>更新时间：{formatDate(room.updated_at)}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          room.is_public
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-gray-900/30 text-gray-400 border border-gray-800'
                        }`}>
                          {room.is_public ? '公开' : '私有'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEnterRoom?.(room.id)}
                      className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      进入房间
                    </button>

                    <button
                      onClick={() => navigator.clipboard.writeText(room.id)}
                      className="bg-gray-600 text-white px-3 py-1 text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      复制ID
                    </button>

                    {room.owner_id === room.owner?.email && (
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        删除
                      </button>
                    )}

                    <button
                      onClick={() => handleLeaveRoom(room.id)}
                      className="bg-yellow-600 text-white px-3 py-1 text-sm rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      离开
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};