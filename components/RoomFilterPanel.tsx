/**
 * 房间筛选面板组件
 * 提供各种筛选选项，支持可折叠设计
 */

import React, { useState } from 'react';
import { RoomFilterParams } from '../types/roomFilters';

export interface RoomFilterPanelProps {
  filters: RoomFilterParams;
  onFilterChange: (key: keyof RoomFilterParams, value: any) => void;
  user?: any; // 用户信息，用于判断"我创建的"开关状态
  className?: string;
}

const RoomFilterPanel: React.FC<RoomFilterPanelProps> = ({
  filters,
  onFilterChange,
  user,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 处理"我创建的"开关切换
  const handleOwnerToggle = (checked: boolean) => {
    onFilterChange('owner', checked ? 'me' : 'all');
  };

  return (
    <div className={`border-b border-zinc-800 bg-zinc-900/30 transition-all duration-200 ${className}`}>
      {/* 筛选面板标题栏 */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>筛选条件</span>
        </button>

        {isExpanded && (
          <button
            onClick={() => {
              // 重置所有筛选条件到默认值
              onFilterChange('owner', 'all');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            重置筛选
          </button>
        )}
      </div>

      {/* 筛选选项内容 */}
      {isExpanded && (
        <div className="px-3 pb-4 space-y-4">
          {/* "我创建的"开关 */}
          {user && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm text-zinc-300">只看我创建的房间</span>
              </div>

              <button
                onClick={() => handleOwnerToggle(filters.owner !== 'me')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  filters.owner === 'me'
                    ? 'bg-blue-600'
                    : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    filters.owner === 'me' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 筛选提示信息 */}
          {!user && (
            <div className="py-2 px-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-400">
                <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                登录后可以筛选自己创建的房间
              </p>
            </div>
          )}

          {/* 当前筛选条件显示 */}
          <div className="text-xs text-zinc-500">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>筛选说明</span>
            </div>
            <ul className="space-y-1 ml-5">
              <li>• 使用搜索框可以按房间名称或描述搜索</li>
              <li>• 排序按钮可以切换创建时间/更新时间排序</li>
              {user && <li>• 开启"我创建的"只显示自己的房间</li>}
            </ul>
          </div>

          {/* 快捷操作 */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded">
                  搜索中: "{filters.search}"
                  <button
                    onClick={() => onFilterChange('search', '')}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomFilterPanel;