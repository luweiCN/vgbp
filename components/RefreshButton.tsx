/**
 * 刷新按钮组件
 * 用于刷新房间列表数据
 */

import React from 'react';

export interface RefreshButtonProps {
  onRefresh: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading = false,
  disabled = false,
  className = ""
}) => {
  return (
    <button
      onClick={onRefresh}
      disabled={disabled || loading}
      className={`
        px-3 py-2 md:py-1.5 bg-zinc-800/50 border border-zinc-800 rounded-lg text-sm text-zinc-300
        hover:bg-zinc-700/50 hover:text-white transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'border-blue-500/50' : ''}
        ${className}
      `}
      title="刷新房间列表"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span>刷新</span>
        </span>
      ) : (
        "刷新"
      )}
    </button>
  );
};

export default RefreshButton;