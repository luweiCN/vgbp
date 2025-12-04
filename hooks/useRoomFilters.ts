/**
 * 房间筛选状态管理Hook
 * 负责URL参数同步等核心功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RoomFilterParams, DEFAULT_FILTER_PARAMS } from '../types/roomFilters';
import {
  parseURLParams,
  buildURLParams,
  getCurrentURLParams
} from '../utils/urlParams';

export interface UseRoomFiltersReturn {
  // 当前筛选状态
  filters: RoomFilterParams;

  // 设置单个筛选条件
  setFilter: <K extends keyof RoomFilterParams>(
    key: K,
    value: RoomFilterParams[K]
  ) => void;

  // 批量设置筛选条件
  setFilters: (filters: Partial<RoomFilterParams>) => void;

  // 清除所有筛选条件
  clearFilters: () => void;
}

export const useRoomFilters = (): UseRoomFiltersReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL初始化筛选状态
  const [filters, setFiltersState] = useState<RoomFilterParams>(() => {
    // 直接从URL参数解析，不要检查window
    const parsed = parseURLParams(searchParams);
    return { ...DEFAULT_FILTER_PARAMS, ...parsed };
  });

  
  
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

  
  // 同步状态到URL
  const syncWithURL = useCallback(() => {
    const newParams = buildURLParams(filters);
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // 监听URL参数变化（浏览器前进后退）
  useEffect(() => {
    const currentFilters = parseURLParams(searchParams);
    const mergedFilters = { ...DEFAULT_FILTER_PARAMS, ...currentFilters };
    setFiltersState(mergedFilters);
  }, [searchParams]);

  // 自动同步到URL（当筛选条件变化时）
  useEffect(() => {
    syncWithURL();
  }, [filters]); // 移除syncWithURL依赖，避免循环

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
  };
};