import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const ModeToggle: React.FC = () => {
  const { user, isConfigured } = useAuth();

  return (
    <div className="flex items-center justify-center p-4 bg-gray-900/50 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-400">
          当前模式：
        </div>

        <div className="flex space-x-2">
          {/* 本地模式按钮 */}
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !user
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📱 本地模式
          </button>

          {/* 在线模式按钮 */}
          <button
            disabled={!isConfigured}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              user
                ? 'bg-blue-600 text-white'
                : isConfigured
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            title={!isConfigured ? '在线功能需要配置 Supabase' : '切换到在线模式'}
          >
            🌐 在线模式
          </button>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            !user ? 'bg-green-500' : 'bg-blue-500'
          }`} />
          <span className="text-sm text-gray-400">
            {!user ? '离线可用' : '已连接'}
          </span>
        </div>

        {/* 配置状态提示 */}
        {!isConfigured && (
          <div className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-800">
            ⚠️ 需要配置 Supabase
          </div>
        )}
      </div>
    </div>
  );
};