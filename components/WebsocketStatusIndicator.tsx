import React from 'react';

interface WebsocketStatusIndicatorProps {
  isRealtimeConnected: boolean;
  isOnlineMode: boolean;
}

const WebsocketStatusIndicator: React.FC<WebsocketStatusIndicatorProps> = ({
  isRealtimeConnected,
  isOnlineMode
}) => {
  if (!isOnlineMode) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 px-3 py-2 rounded-full text-xs font-medium z-50 flex items-center gap-2 ${
      isRealtimeConnected
        ? 'bg-green-900/80 text-green-300 border border-green-700'
        : 'bg-orange-900/80 text-orange-300 border border-orange-700'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isRealtimeConnected ? 'bg-green-400' : 'bg-orange-400 animate-pulse'
      }`} />
      {isRealtimeConnected ? 'WebSocket实时连接' : '轮询同步模式'}
    </div>
  );
};

export default WebsocketStatusIndicator;