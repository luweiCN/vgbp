/**
 * URL参数处理工具函数
 */

import { RoomFilterParams, DEFAULT_FILTER_PARAMS } from '../types/roomFilters';

/**
 * 检查是否为默认的 pageSize
 */
const isDefaultPageSize = (pageSize: number): boolean => {
  if (typeof window !== 'undefined') {
    const defaultSize = window.innerWidth < 640 ? 5 : 10;
    return pageSize === defaultSize;
  }
  return pageSize === 10; // 默认PC端
};

/**
 * 将URLSearchParams转换为RoomFilterParams
 */
export const parseURLParams = (searchParams: URLSearchParams): RoomFilterParams => {
  const params: RoomFilterParams = {};

  // 解析页码
  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      params.page = pageNum;
    }
  }

  // 解析搜索关键词
  const search = searchParams.get('search');
  if (search) {
    params.search = search;
  }

  // 解析所有者筛选
  const owner = searchParams.get('owner');
  if (owner === 'me' || owner === 'all') {
    params.owner = owner;
  }

  // 解析排序字段
  const sort = searchParams.get('sort');
  if (sort === 'created' || sort === 'updated') {
    params.sort = sort;
  }

  // 解析排序方向
  const order = searchParams.get('order');
  if (order === 'asc' || order === 'desc') {
    params.order = order;
  }

  // 解析每页数量
  const pageSize = searchParams.get('pageSize');
  if (pageSize) {
    const pageSizeNum = parseInt(pageSize, 10);
    if (!isNaN(pageSizeNum) && pageSizeNum > 0 && [5, 10, 15, 20].includes(pageSizeNum)) {
      params.pageSize = pageSizeNum;
    }
  }

  return { ...DEFAULT_FILTER_PARAMS, ...params };
};

/**
 * 将RoomFilterParams转换为URLSearchParams
 */
export const buildURLParams = (filters: RoomFilterParams): URLSearchParams => {
  const params = new URLSearchParams();

  // 只添加非默认值且非空的参数
  if (filters.page && filters.page !== 1) {
    params.set('page', filters.page.toString());
  }

  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.owner && filters.owner !== 'all') {
    params.set('owner', filters.owner);
  }

  if (filters.sort && filters.sort !== 'updated') {
    params.set('sort', filters.sort);
  }

  if (filters.order && filters.order !== 'desc') {
    params.set('order', filters.order);
  }

  if (filters.pageSize) {
    params.set('pageSize', filters.pageSize.toString());
  }

  return params;
};

/**
 * 获取当前URL中的筛选参数
 */
export const getCurrentURLParams = (): RoomFilterParams => {
  if (typeof window === 'undefined') {
    return DEFAULT_FILTER_PARAMS as RoomFilterParams;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return parseURLParams(searchParams);
};

/**
 * 构建带有筛选参数的URL
 */
export const buildFilterURL = (baseURL: string, filters: RoomFilterParams): string => {
  const url = new URL(baseURL);
  const params = buildURLParams(filters);

  // 清除现有参数
  url.search = '';

  // 添加新的参数
  params.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

/**
 * 清除所有筛选参数，只保留基础URL
 */
export const clearFilterParams = (baseURL: string): string => {
  const url = new URL(baseURL);
  url.search = '';
  return url.toString();
};

/**
 * 获取筛选参数的数量（用于显示筛选条件数量）
 */
export const getActiveFiltersCount = (filters: RoomFilterParams): number => {
  let count = 0;

  if (filters.search && filters.search.trim()) count++;
  if (filters.owner && filters.owner === 'me') count++;
  if (filters.sort && filters.sort !== 'updated') count++;
  if (filters.order && filters.order !== 'desc') count++;
  if (filters.page && filters.page > 1) count++;

  return count;
};

/**
 * 检查是否有活跃的筛选条件
 */
export const hasActiveFilters = (filters: RoomFilterParams): boolean => {
  return getActiveFiltersCount(filters) > 0;
};