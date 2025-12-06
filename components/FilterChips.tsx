/**
 * 筛选条件显示组件
 * 显示当前活跃的筛选条件，支持快速移除
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RoomFilterParams } from '@/types/roomFilters';
import { FILTER_VALUE_LABELS } from '@/types/roomFilters';
import { useSafeI18n } from '@/i18n/components/useSafeI18n';
import { Icon } from '@/components/ui/Icon';

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
  const { user } = useAuth();
  const { translate: t } = useSafeI18n();
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
        label: t("ui.components.filterChips.search"),
        value: filters.search,
        valueLabel: `"${filters.search}"`
      });
    }

    // 所有者筛选（仅用户登录时显示）
    if (filters.owner && user?.id) {
      activeFilters.push({
        key: 'owner',
        label: t("ui.components.filterChips.owner"),
        value: filters.owner,
        valueLabel: filters.owner === 'me'
          ? t("ui.components.filterChips.mine")
          : t("ui.components.filterChips.all")
      });
    }

    // 排序方式（始终显示）
    if (filters.sort) {
      activeFilters.push({
        key: 'sort',
        label: t("ui.components.filterChips.sort"),
        value: filters.sort,
        valueLabel: filters.sort === 'created'
          ? t("ui.components.filterChips.createdTime")
          : t("ui.components.filterChips.updatedTime")
      });
    }

    // 排序方向（始终显示）
    if (filters.order) {
      activeFilters.push({
        key: 'order',
        label: t("ui.components.filterChips.direction"),
        value: filters.order,
        valueLabel: filters.order === 'asc'
          ? t("ui.components.filterChips.ascOrder")
          : t("ui.components.filterChips.descOrder")
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
      <span className="text-xs text-zinc-500 hidden sm:inline">{t("ui.components.filterChips.filter")}</span>

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
          title={t("ui.components.filterChips.resetAllFilters")}
        >
          <Icon icon={RotateCcw} preset="xs" />
          <span>{t("ui.components.filterChips.reset")}</span>
        </button>
      </div>
    </div>
  );
};

export default FilterChips;