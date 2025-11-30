import React from 'react';
import { usePermissionCheck } from '../hooks/usePermissions';

interface PermissionIndicatorProps {
  roomId?: string;
  showDetails?: boolean;
}

const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({
  roomId,
  showDetails = false
}) => {
  const { role, canEdit, canManageRoom, canDeleteRoom, canInviteUsers } = usePermissionCheck(roomId);

  const getRoleInfo = () => {
    switch (role) {
      case 'owner':
        return {
          text: '房主',
          color: 'bg-green-600',
          textColor: 'text-green-400',
          icon: '👑',
          description: '拥有所有权限，可以管理房间和编辑英雄选择'
        };
      case 'participant':
        return {
          text: '参与者',
          color: 'bg-blue-600',
          textColor: 'text-blue-400',
          icon: '👤',
          description: '可以查看房间状态，邀请其他用户'
        };
      case 'anonymous':
        return {
          text: '查看模式',
          color: 'bg-orange-600',
          textColor: 'text-orange-400',
          icon: '👁️',
          description: '只能查看房间状态，不能编辑'
        };
      default:
        return {
          text: '未知',
          color: 'bg-gray-600',
          textColor: 'text-gray-400',
          icon: '❓',
          description: '权限状态未知'
        };
    }
  };

  const roleInfo = getRoleInfo();

  if (!roomId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* 基础权限指示器 */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${roleInfo.color} bg-opacity-20 border ${roleInfo.color} border-opacity-50`}>
        <span className="text-sm">{roleInfo.icon}</span>
        <span className={`text-sm font-medium ${roleInfo.textColor}`}>
          {roleInfo.text}
        </span>
        {canEdit && (
          <span className={`text-xs ${roleInfo.textColor} opacity-75`}>
            (可编辑)
          </span>
        )}
      </div>

      {/* 详细权限信息 */}
      {showDetails && (
        <div className="relative group">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* 权限详情弹窗 */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-white mb-1">当前权限</h4>
                <p className="text-xs text-zinc-400">{roleInfo.description}</p>
              </div>

              <div className="border-t border-zinc-700 pt-3">
                <h4 className="font-medium text-white mb-2">具体权限</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${canEdit ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-zinc-300">编辑英雄选择</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${canManageRoom ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-zinc-300">管理房间设置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${canDeleteRoom ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-zinc-300">删除房间</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${canInviteUsers ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-zinc-300">邀请用户</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionIndicator;