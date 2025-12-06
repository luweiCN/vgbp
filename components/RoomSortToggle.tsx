/**
 * 房间排序切换组件
 * 参考ClassificationToggle的设计模式，支持循环切换排序
 */

import React from 'react';
import { SortOption, SORT_OPTIONS } from '@/types/roomFilters';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Calendar, Clock, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

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
    <div className={`flex items-center gap-2 flex-1 sm:w-full overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-zinc-400 hidden sm:inline">{t('ui.components.roomSortToggle.sortLabel')}</span>

        {/* 排序方式选择器 */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1 flex-1 min-w-0 shrink-0 lg:max-w-56">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                // 保持当前的排序方向，除非切换到新的排序方式
                const defaultOrder = option.value === 'created' || option.value === 'updated' ? 'desc' : 'asc';
                onChange(option.value, sortBy === option.value ? sortOrder : defaultOrder);
              }}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 whitespace-nowrap overflow-hidden flex-1 min-w-0 ${
                sortBy === option.value
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
              title={option.label}
            >
              <Icon icon={option.value === 'created' ? Calendar : Clock} preset="sm" className={option.value === 'created' ? "text-blue-400" : "text-green-400"} />
              <span
                className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
              >
                {option.value === 'created'
                  ? t('ui.components.roomSortToggle.createdTime')
                  : t('ui.components.roomSortToggle.updatedTime')
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 排序方向切换按钮 */}
      <button
        onClick={handleOrderToggle}
        className="p-2 w-8 h-8 text-zinc-400 hover:text-zinc-200 transition-colors rounded flex-shrink-0"
        title={t('ui.components.roomSortToggle.sortDirectionTitle') + (sortOrder === 'desc' ? t('ui.components.roomSortToggle.descOrder') : t('ui.components.roomSortToggle.ascOrder'))}
      >
        <Icon icon={sortOrder === 'desc' ? ArrowDownNarrowWide : ArrowUpNarrowWide} preset="sm" />
      </button>
    </div>
  );
};

export default RoomSortToggle;