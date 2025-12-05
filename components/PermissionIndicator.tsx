import React from 'react';
import { usePermissionCheck } from '../hooks/usePermissions';
import { useI18n } from '../i18n/hooks/useI18n';

interface PermissionIndicatorProps {
  roomId?: string;
  showDetails?: boolean;
}

const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({
  roomId,
  showDetails = false
}) => {
  const { t } = useI18n();
  const { role, canEdit, canManageRoom, canDeleteRoom } = usePermissionCheck(roomId);

  const getRoleInfo = () => {
    switch (role) {
      case 'owner':
        return {
          text: t('ui.components.permissionIndicator.owner.text'),
          color: 'bg-green-600',
          textColor: 'text-green-400',
          icon: '👑',
          description: t('ui.components.permissionIndicator.owner.description')
        };
      case 'anonymous':
        // 将匿名用户显示为"查看模式"
        return {
          text: t('ui.components.permissionIndicator.viewer.text'),
          color: 'bg-orange-600',
          textColor: 'text-orange-400',
          icon: '👁️',
          description: t('ui.components.permissionIndicator.viewer.description')
        };
      default:
        return {
          text: t('ui.components.permissionIndicator.participant.text'),
          color: 'bg-blue-600',
          textColor: 'text-blue-400',
          icon: '👤',
          description: t('ui.components.permissionIndicator.participant.description')
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
            {t('ui.components.permissionIndicator.editable')}
          </span>
        )}
      </div>


    </div>
  );
};

export default PermissionIndicator;