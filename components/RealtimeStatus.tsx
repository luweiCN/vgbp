import React from 'react';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastSyncTime: number | null;
  lastSendTime: number | null;
  syncMethod: 'realtime' | 'polling' | 'none';
  isOnlineMode: boolean;
}

const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  isConnected,
  lastSyncTime,
  lastSendTime,
  syncMethod,
  isOnlineMode
}) => {
  if (!isOnlineMode) {
    return null;
  }

  // 获取最新的活动时间（发送或接收）
  const getLastActivityTime = (): number | null => {
    if (!lastSyncTime && !lastSendTime) return null;
    if (!lastSyncTime) return lastSendTime;
    if (!lastSendTime) return lastSyncTime;
    return Math.max(lastSyncTime, lastSendTime);
  };

  const formatSyncTime = (time: number | null): string => {
    if (!time) return '从未同步';

    const now = Date.now();
    const diff = now - time;

    if (diff < 1000) return '刚刚';
    if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    return new Date(time).toLocaleTimeString();
  };

  // 判断连接是否工作正常
  const hasRecentActivity = getLastActivityTime() && (Date.now() - getLastActivityTime()! < 15000); // 15秒内有活动
  const isWorking = isConnected || syncMethod === 'realtime' || syncMethod === 'polling';

  const getStatusColor = () => {
    if (isWorking && hasRecentActivity) {
      return 'bg-green-500';
    } else if (syncMethod === 'polling' && hasRecentActivity) {
      return 'bg-blue-500';
    } else {
      return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    if (syncMethod === 'realtime' && isConnected) {
      return '实时连接正常';
    } else if (syncMethod === 'realtime' && hasRecentActivity) {
      return '实时同步中';
    } else if (syncMethod === 'polling' && hasRecentActivity) {
      return '轮询同步中';
    } else if (syncMethod === 'realtime') {
      return '实时连接断开';
    } else if (syncMethod === 'polling') {
      return '轮询同步断开';
    } else {
      return '连接断开';
    }
  };

  const getSyncMethodText = () => {
    switch (syncMethod) {
      case 'realtime':
        return '实时';
      case 'polling':
        return '轮询';
      default:
        return '离线';
    }
  };

  const getSyncMethodColor = () => {
    switch (syncMethod) {
      case 'realtime':
        return 'text-green-400';
      case 'polling':
        return 'text-blue-400';
      default:
        return 'text-red-400';
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400">
      {/* 连接状态指示器 */}
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${
            hasRecentActivity ? 'animate-pulse' : ''
          }`}
        />
        <span>{getStatusText()}</span>
      </div>

      {/* 同步方式标识 */}
      <div className="flex items-center gap-1">
        <span className={`font-medium ${getSyncMethodColor()}`}>
          [{getSyncMethodText()}]
        </span>
      </div>

      {/* 最后同步时间 */}
      <div className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>最后活动: {formatSyncTime(getLastActivityTime())}</span>
      </div>

      {/* 详细信息提示 */}
      {syncMethod === 'realtime' && lastSendTime && (
        <div className="hidden sm:block text-zinc-500">
          发送: {formatSyncTime(lastSendTime)}
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;