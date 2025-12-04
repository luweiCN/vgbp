import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  addedHeroIds?: string[];
  removedHeroIds?: string[];
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'error', addedHeroIds?: string[], removedHeroIds?: string[]) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = {
      id,
      message,
      type,
      addedHeroIds,
      removedHeroIds
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showError = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const showSuccess = useCallback((message: string) => {
    return addToast(message, 'success');
  }, [addToast]);
  const showWarning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);
  const showInfo = useCallback((message: string, addedHeroIds?: string[], removedHeroIds?: string[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[showInfo被调用]', { message, addedHeroIds, removedHeroIds });
    }
    return addToast(message, 'info', addedHeroIds, removedHeroIds);
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearAll
  };
};