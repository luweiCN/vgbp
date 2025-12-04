/**
 * 房间排序切换组件
 * 参考ClassificationToggle的设计模式，支持循环切换排序
 */

import React from 'react';
import { SortOption, SORT_OPTIONS } from '../types/roomFilters';
import { useI18n } from '@/i18n/hooks/useI18n';

export interface RoomSortToggleProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  className?: string;
}

const RoomSortToggle: React.FC<RoomSortToggleProps> = ({
  sortBy,
  sortOrder,
  onChange,
  className = ""
}) => {
  const { t } = useI18n();
  // 获取当前排序选项
  const currentSortOption = SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0];

  // 切换排序方向
  const handleOrderToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onChange(sortBy, newOrder);
  };

  // 统一样式 - 排序方式选择和方向切换
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-zinc-400 hidden sm:inline">{t('ui.components.roomSortToggle.sortLabel')}</span>

      {/* 排序方式选择器 */}
      <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              // 保持当前的排序方向，除非切换到新的排序方式
              const defaultOrder = option.value === 'created' || option.value === 'updated' ? 'desc' : 'asc';
              onChange(option.value, sortBy === option.value ? sortOrder : defaultOrder);
            }}
            className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 whitespace-nowrap overflow-hidden max-w-20 ${
              sortBy === option.value
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
            title={option.label}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={option.icon}
              />
            </svg>
            <span>
              {option.value === 'created'
                ? t('ui.components.roomSortToggle.createdTime')
                : t('ui.components.roomSortToggle.updatedTime')
              }
            </span>
          </button>
        ))}
      </div>

      {/* 排序方向切换按钮 */}
      <button
        onClick={handleOrderToggle}
        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded"
        title={t('ui.components.roomSortToggle.sortDirectionTitle') + (sortOrder === 'desc' ? t('ui.components.roomSortToggle.descOrder') : t('ui.components.roomSortToggle.ascOrder'))}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {sortOrder === 'desc' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5 0v12m0 0l-4-4m4 4l4-4" />
          )}
        </svg>
      </button>
    </div>
  );
};

export default RoomSortToggle;