import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

interface PaginationProps {
  totalItems: number;
  defaultPageSize?: number;
  mobileDefaultPageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  defaultPageSize = 10,
  mobileDefaultPageSize = 5,
  pageSizeOptions = [5, 10, 15, 20],
  className = '',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 从URL获取当前页码和pageSize
  const getPaginationFromURL = useCallback((): PaginationState => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlPageSize = parseInt(searchParams.get('pageSize') || '', 10);

    // 根据屏幕尺寸确定默认pageSize
    const getDefaultPageSize = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 640 ? mobileDefaultPageSize : defaultPageSize;
      }
      return defaultPageSize;
    };

    const currentPage = urlPage > 0 ? urlPage : 1;
    const pageSize = urlPageSize > 0 && pageSizeOptions.includes(urlPageSize)
      ? urlPageSize
      : getDefaultPageSize();
    const totalPages = Math.ceil(totalItems / pageSize);

    return { currentPage, pageSize, totalPages };
  }, [searchParams, defaultPageSize, mobileDefaultPageSize, pageSizeOptions, totalItems]);

  const [state, setState] = useState<PaginationState>(() => getPaginationFromURL());

  // 监听URL参数变化，但只在参数真正改变时更新状态
  useEffect(() => {
    const newState = getPaginationFromURL();
    setState(prev => {
      // 只有当值真正改变时才更新
      if (prev.currentPage !== newState.currentPage ||
          prev.pageSize !== newState.pageSize ||
          prev.totalPages !== newState.totalPages) {
        return newState;
      }
      return prev;
    });
  }, [searchParams, totalItems]);

  // 更新URL参数
  const updateURL = useCallback((page: number, pageSize: number) => {
    const getDefaultPageSize = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 640 ? mobileDefaultPageSize : defaultPageSize;
      }
      return defaultPageSize;
    };

    // 检查参数是否需要更新
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentPageSize = parseInt(searchParams.get('pageSize') || '', 10);

    const newPage = page !== 1 ? page : null;
    const newPageSize = pageSize !== getDefaultPageSize() ? pageSize : null;

    // 如果参数没有变化，不更新URL
    if (currentPage === newPage && currentPageSize === newPageSize) {
      return;
    }

    const newParams = new URLSearchParams(searchParams);

    // 更新页码
    if (newPage) {
      newParams.set('page', newPage.toString());
    } else {
      newParams.delete('page');
    }

    // 更新pageSize
    if (newPageSize) {
      newParams.set('pageSize', newPageSize.toString());
    } else {
      newParams.delete('pageSize');
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams, defaultPageSize, mobileDefaultPageSize]);

  // 处理页码变化
  const handlePageChange = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, state.totalPages));
    if (validPage !== state.currentPage) {
      setState(prev => ({ ...prev, currentPage: validPage }));
      updateURL(validPage, state.pageSize);
    }
  }, [state.currentPage, state.totalPages, state.pageSize, updateURL]);

  // 处理pageSize变化
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (newPageSize !== state.pageSize) {
      const totalPages = Math.ceil(totalItems / newPageSize);
      setState(prev => ({
        ...prev,
        pageSize: newPageSize,
        currentPage: Math.min(prev.currentPage, totalPages || 1),
        totalPages
      }));
      updateURL(1, newPageSize);
    }
  }, [state.pageSize, totalItems, updateURL]);

  // 处理移动端pageSize切换
  const handleMobilePageSizeToggle = useCallback(() => {
    const currentIndex = pageSizeOptions.indexOf(state.pageSize);
    const nextIndex = (currentIndex + 1) % pageSizeOptions.length;
    const nextPageSize = pageSizeOptions[nextIndex];
    handlePageSizeChange(nextPageSize);
  }, [state.pageSize, pageSizeOptions, handlePageSizeChange]);

  // 如果没有数据，不显示分页
  if (totalItems <= 0) {
    return null;
  }

  return (
    <div className={`flex justify-end items-center gap-1 mt-8 w-full ${className}`}>
      <span className="text-sm text-zinc-400 hidden sm:inline">每页</span>
      <span className="text-sm text-zinc-400 sm:hidden">每页</span>

      {/* PC端：显示所有按钮 */}
      <div className="hidden sm:flex items-center justify-center border border-zinc-700 rounded-lg px-1" style={{ height: '40px' }}>
        {pageSizeOptions.map((size, index) => (
          <button
            key={size}
            onClick={() => handlePageSizeChange(size)}
            className={`
              w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-all duration-200 whitespace-nowrap
              ${index > 0 ? 'ml-1' : ''}
              ${state.pageSize === size
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>

      {/* 移动端：单个循环切换按钮 */}
      <button
        onClick={handleMobilePageSizeToggle}
        className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200 whitespace-nowrap sm:hidden"
      >
        {/* 切换图标 */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{state.pageSize}</span>
      </button>

      <span className="text-sm text-zinc-400 mr-4">条</span>

      <button
        onClick={() => handlePageChange(state.currentPage - 1)}
        disabled={state.currentPage === 1}
        className="flex items-center gap-2 h-10 px-4 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {/* 上一页图标 */}
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">上一页</span>
      </button>

      <div className="flex items-center mx-2">
        <span className="text-sm text-zinc-400 whitespace-nowrap">
          <span className="hidden sm:inline">第 {state.currentPage} 页，共 {state.totalPages} 页</span>
          <span className="sm:hidden mx-2">{state.currentPage} / {state.totalPages} 页</span>
        </span>
      </div>

      <button
        onClick={() => handlePageChange(state.currentPage + 1)}
        disabled={state.currentPage >= state.totalPages}
        className="flex items-center gap-2 h-10 px-4 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <span className="hidden sm:inline">下一页</span>
        {/* 下一页图标 */}
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// 导出类型供外部使用
export type { PaginationProps };