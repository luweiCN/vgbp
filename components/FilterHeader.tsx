import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { RoomSearchBox } from './RoomSearchBox';
import RoomSortToggle from './RoomSortToggle';
import OwnerToggle from './OwnerToggle';
import FilterChips from './FilterChips';

interface FilterHeaderProps {
  totalRooms: number;
  filteredTotal: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  loading: boolean;
  filters: any;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  totalRooms,
  filteredTotal,
  searchValue,
  onSearchChange,
  onSearch,
  onClearSearch,
  loading,
  filters,
  setFilter,
  setFilters,
  clearFilters,
}) => {
  const { user } = useAuth();
  return (
    <div className="py-4 space-y-3">
      {/* 标题和统计 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">房间列表</h2>
        <div className="text-sm text-blue-400">
          {filteredTotal === totalRooms ? (
            <span>总共 {totalRooms} 个房间</span>
          ) : (
            <>
              <span className="hidden sm:inline">
                当前筛选条件下共 {filteredTotal} 个房间，总共 {totalRooms}{" "}
                个房间
              </span>
              <span className="sm:hidden">
                共{filteredTotal}/{totalRooms}个房间
              </span>
            </>
          )}
        </div>
      </div>

      {/* 搜索和筛选控件 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* 搜索和刷新区域 - 紧密排列 */}
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md">
          {/* 搜索框 - 占据主要空间 */}
          <RoomSearchBox
            value={searchValue}
            onChange={onSearchChange}
            onClear={onClearSearch}
            onSearch={onSearch}
            loading={loading}
            className="flex-1"
          />
        </div>

        {/* 右侧控制区 - 筛选和排序，与左侧拉开距离 */}
        <div className="flex items-center gap-3">
          {/* "我创建的"开关 */}
          {user?.id && (
            <OwnerToggle
              isChecked={filters.owner === "me"}
              onChange={(checked: boolean) =>
                setFilter("owner", checked ? "me" : "all")
              }
              className="mx-2"
            />
          )}

          {/* 排序切换 */}
          <RoomSortToggle
            sortBy={filters.sort || "updated"}
            sortOrder={filters.order || "desc"}
            onChange={(sortBy: string, sortOrder: string) => {
              setFilters({ sort: sortBy, order: sortOrder });
            }}
          />
        </div>
      </div>

      {/* 筛选条件显示 */}
      <FilterChips
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearFilters}
      />
    </div>
  );
};