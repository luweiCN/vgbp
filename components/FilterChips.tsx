/**
 * 筛选条件显示组件
 * 显示当前活跃的筛选条件，支持快速移除
 */

import React from 'react';
import { RoomFilterParams } from '../types/roomFilters';
import { FILTER_VALUE_LABELS } from '../types/roomFilters';

export interface FilterChipsProps {
  filters: RoomFilterParams;
  onFilterChange: (key: keyof RoomFilterParams, value: any) => void;
  onClearAll: () => void;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  className = ""
}) => {
  // 获取需要显示的筛选条件
  const getActiveFilters = () => {
    const activeFilters: Array<{
      key: keyof RoomFilterParams;
      label: string;
      value: string;
      valueLabel: string;
    }> = [];

    // 搜索条件
    if (filters.search && filters.search.trim()) {
      activeFilters.push({
        key: 'search',
        label: '搜索',
        value: filters.search,
        valueLabel: `"${filters.search}"`
      });
    }

    // 所有者筛选（始终显示）
    if (filters.owner) {
      activeFilters.push({
        key: 'owner',
        label: '所有者',
        value: filters.owner,
        valueLabel: FILTER_VALUE_LABELS.owner[filters.owner] || filters.owner
      });
    }

    // 排序方式（始终显示）
    if (filters.sort) {
      activeFilters.push({
        key: 'sort',
        label: '排序',
        value: filters.sort,
        valueLabel: FILTER_VALUE_LABELS.sort[filters.sort] || filters.sort
      });
    }

    // 排序方向（始终显示）
    if (filters.order) {
      activeFilters.push({
        key: 'order',
        label: '方向',
        value: filters.order,
        valueLabel: FILTER_VALUE_LABELS.order[filters.order] || filters.order
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  // 移除单个筛选条件
  const handleRemoveFilter = (key: keyof RoomFilterParams) => {
    switch (key) {
      case 'search':
        onFilterChange('search', '');
        break;
      case 'owner':
        onFilterChange('owner', 'all');
        break;
      case 'sort':
        onFilterChange('sort', 'updated');
        break;
      case 'order':
        onFilterChange('order', 'desc');
        break;
      case 'page':
        onFilterChange('page', 1);
        break;
      default:
        onFilterChange(key, undefined);
    }
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-xs text-zinc-500 hidden sm:inline">筛选:</span>

      {/* 筛选条件Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs"
          >
            <span className="text-zinc-300">
              <span className="hidden sm:inline">{filter.label}: </span>
              <span className="text-blue-400 font-medium">{filter.valueLabel}</span>
            </span>
          </div>
        ))}

        {/* 重置按钮 */}
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700/50 hover:bg-zinc-700/70 border border-zinc-600/30 rounded-full text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          title="重置所有筛选条件"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>重置</span>
        </button>
      </div>
    </div>
  );
};

export default FilterChips;