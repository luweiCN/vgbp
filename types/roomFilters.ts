/**
 * 房间筛选和搜索相关的类型定义
 */

// URL参数接口
export interface RoomFilterParams {
  page?: number;           // 页码，默认1
  search?: string;         // 搜索关键词
  owner?: 'me' | 'all';    // 我创建的 vs 所有房间
  sort?: 'created' | 'updated'; // 排序字段
  order?: 'asc' | 'desc';  // 排序方向，默认desc
  pageSize?: number;       // 每页数量，默认移动端5，PC端10
}

// 排序选项定义
export interface SortOption {
  value: 'created' | 'updated';
  label: string;
  field: 'created_at' | 'updated_at';
  icon: string;
}

// 排序选项
export const SORT_OPTIONS: SortOption[] = [
  {
    value: 'created',
    label: '创建时间',
    field: 'created_at',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' // 日历图标，与列表页面保持一致
  },
  {
    value: 'updated',
    label: '更新时间',
    field: 'updated_at',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' // 刷新图标
  }
];

// 默认筛选参数
export const DEFAULT_FILTER_PARAMS: Partial<RoomFilterParams> = {
  page: 1,
  owner: 'all',
  sort: 'updated',
  order: 'desc',
  pageSize: undefined // 让组件决定默认值
};

// 筛选条件显示映射
export const FILTER_LABELS: Record<keyof RoomFilterParams, string> = {
  page: '页码',
  search: '搜索',
  owner: '所有者',
  sort: '排序',
  order: '排序方向',
  pageSize: '每页数量'
};

// 筛选值显示映射
export const FILTER_VALUE_LABELS: Record<string, Record<string, string>> = {
  owner: {
    'me': '我创建的',
    'all': '所有房间'
  },
  sort: {
    'created': '创建时间',
    'updated': '更新时间'
  },
  order: {
    'asc': '升序',
    'desc': '倒序'
  }
};

// 扩展的房间查询选项
export interface RoomFetchOptions {
  ownerId?: string;
  page?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 房间查询结果
export interface RoomFetchResult {
  data: any[];
  total: number;
  error?: any;
}