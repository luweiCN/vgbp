import React from 'react';
import RealtimeStatus from './RealtimeStatus';
import PermissionIndicator from './PermissionIndicator';

interface OnlineModeIndicatorProps {
  roomId: string | null;
  isConnected: boolean;
  lastSyncTime: number | null;
  lastSendTime: number | null;
  syncMethod: 'realtime' | 'polling' | 'none';
  isOnlineMode: boolean;
  isOwner?: boolean;
  canEdit?: boolean;
}

const OnlineModeIndicator: React.FC<OnlineModeIndicatorProps> = ({
  roomId,
  isConnected,
  lastSyncTime,
  lastSendTime,
  syncMethod,
  isOnlineMode,
  isOwner,
  canEdit
}) => {
  // 只有在线模式才显示指示栏
  if (!isOnlineMode) {
    return null;
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto pt-3">
        <div className="flex justify-between items-center">
          {/* 左侧：实时状态指示 */}
          <div className="flex items-center gap-4">
            <RealtimeStatus
              isConnected={isConnected}
              lastSyncTime={lastSyncTime}
              lastSendTime={lastSendTime}
              syncMethod={syncMethod}
              isOnlineMode={isOnlineMode}
            />
          </div>

          {/* 右侧：权限指示 */}
          <div className="flex items-center gap-4">
            <PermissionIndicator
              roomId={roomId || undefined}
              showDetails={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineModeIndicator;