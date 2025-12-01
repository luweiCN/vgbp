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
      <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full ${roleInfo.color} bg-opacity-20 border ${roleInfo.color} border-opacity-50 whitespace-nowrap`}>
        <span className="text-sm">{roleInfo.icon}</span>
        <span className={`text-sm font-medium ${roleInfo.textColor}`}>
          {roleInfo.text}
        </span>
        {canEdit && (
          <span className={`text-xs ${roleInfo.textColor} opacity-75 hidden sm:inline`}>
            (可编辑)
          </span>
        )}
      </div>


    </div>
  );
};

export default PermissionIndicator;