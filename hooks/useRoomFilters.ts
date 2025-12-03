/**
 * 房间筛选状态管理Hook
 * 负责URL参数同步、防抖搜索等核心功能
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RoomFilterParams, DEFAULT_FILTER_PARAMS } from '../types/roomFilters';
import {
  parseURLParams,
  buildURLParams,
  getCurrentURLParams,
  getActiveFiltersCount,
  hasActiveFilters
} from '../utils/urlParams';

/**
 * 防抖Hook
 */
const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export interface UseRoomFiltersReturn {
  // 当前筛选状态
  filters: RoomFilterParams;

  // 防抖后的搜索值（用于实际查询）
  debouncedSearch: string;

  // 设置单个筛选条件
  setFilter: <K extends keyof RoomFilterParams>(
    key: K,
    value: RoomFilterParams[K]
  ) => void;

  // 批量设置筛选条件
  setFilters: (filters: Partial<RoomFilterParams>) => void;

  // 清除所有筛选条件
  clearFilters: () => void;

  // 重置为默认值
  resetFilters: () => void;

  // 同步当前状态到URL
  syncWithURL: () => void;

  // 统计信息
  activeFiltersCount: number;
  hasAnyActiveFilters: boolean;
}

export const useRoomFilters = (): UseRoomFiltersReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL初始化筛选状态
  const [filters, setFiltersState] = useState<RoomFilterParams>(() => {
    if (typeof window !== 'undefined') {
      return parseURLParams(searchParams);
    }
    return DEFAULT_FILTER_PARAMS as RoomFilterParams;
  });

  // 防抖搜索（300ms延迟）
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);

  // 统计活跃筛选条件数量
  const activeFiltersCount = useMemo(() =>
    getActiveFiltersCount(filters),
    [filters]
  );

  const hasAnyActiveFilters = useMemo(() =>
    hasActiveFilters(filters),
    [filters]
  );

  // 设置单个筛选条件
  const setFilter = useCallback(<K extends keyof RoomFilterParams>(
    key: K,
    value: RoomFilterParams[K]
  ) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // 批量设置筛选条件
  const setFilters = useCallback((newFilters: Partial<RoomFilterParams>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // 清除所有筛选条件
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTER_PARAMS as RoomFilterParams);
  }, []);

  // 重置为默认值
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTER_PARAMS as RoomFilterParams);
  }, []);

  // 同步状态到URL
  const syncWithURL = useCallback(() => {
    const newParams = buildURLParams(filters);
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // 监听URL参数变化（浏览器前进后退）
  useEffect(() => {
    const currentFilters = parseURLParams(searchParams);
    setFiltersState(currentFilters);
  }, [searchParams]);

  // 自动同步到URL（当筛选条件变化时）
  useEffect(() => {
    syncWithURL();
  }, [filters, syncWithURL]);

  return {
    filters,
    debouncedSearch,
    setFilter,
    setFilters,
    clearFilters,
    resetFilters,
    syncWithURL,
    activeFiltersCount,
    hasAnyActiveFilters
  };
};