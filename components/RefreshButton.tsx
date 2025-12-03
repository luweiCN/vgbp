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
        px-3 py-2 md:py-1.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 rounded-lg text-sm text-white
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'border-blue-500/50' : ''}
        ${className}
      `}
      title="搜索房间"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span>搜索</span>
        </span>
      ) : (
        "搜索"
      )}
    </button>
  );
};

export default RefreshButton;