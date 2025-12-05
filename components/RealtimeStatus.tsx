import React from 'react';
import { useI18n } from '../i18n/hooks/useI18n';

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
  const { t } = useI18n();

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
    if (!time) return t('ui.components.realtimeStatus.time.never');

    const now = Date.now();
    const diff = now - time;

    if (diff < 1000) return t('ui.components.realtimeStatus.time.justNow');
    if (diff < 60000) return t('ui.components.realtimeStatus.time.secondsAgo', { count: Math.floor(diff / 1000) });
    if (diff < 3600000) return t('ui.components.realtimeStatus.time.minutesAgo', { count: Math.floor(diff / 60000) });
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
      return t('ui.components.realtimeStatus.status.connected');
    } else if (syncMethod === 'realtime' && hasRecentActivity) {
      return t('ui.components.realtimeStatus.status.syncing');
    } else if (syncMethod === 'polling' && hasRecentActivity) {
      return t('ui.components.realtimeStatus.status.polling');
    } else if (syncMethod === 'realtime') {
      return t('ui.components.realtimeStatus.status.disconnected');
    } else if (syncMethod === 'polling') {
      return t('ui.components.realtimeStatus.status.pollingDisconnected');
    } else {
      return t('ui.components.realtimeStatus.status.offline');
    }
  };

  const getSyncMethodText = () => {
    switch (syncMethod) {
      case 'realtime':
        return t('ui.components.realtimeStatus.connection.realtime');
      case 'polling':
        return t('ui.components.realtimeStatus.connection.polling');
      default:
        return t('ui.components.realtimeStatus.connection.offline');
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
          title={getStatusText()}
        />
        <span>{getStatusText()}</span>
      </div>

      {/* 同步方式标识 */}
      <div className="flex items-center gap-1">
        <span className={`font-medium ${getSyncMethodColor()}`}>
          [{getSyncMethodText()}]
        </span>
      </div>

      {/* 最后同步时间 - 桌面端显示完整文字，移动端只显示时间 */}
      <div className="flex items-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          title={`${t('ui.components.realtimeStatus.time.lastActivity')}: ${formatSyncTime(getLastActivityTime())}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="hidden sm:inline">{t('ui.components.realtimeStatus.time.lastActivity')}: {formatSyncTime(getLastActivityTime())}</span>
        <span className="sm:hidden">{formatSyncTime(getLastActivityTime())}</span>
      </div>

      {/* 详细信息提示 */}
      {syncMethod === 'realtime' && lastSendTime && (
        <div className="hidden sm:block text-zinc-500">
          {t('ui.components.realtimeStatus.time.lastSend')}: {formatSyncTime(lastSendTime)}
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;