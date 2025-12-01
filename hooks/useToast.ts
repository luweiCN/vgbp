import { useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  addedHeroIds?: string[];
  removedHeroIds?: string[];
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem['type'] = 'error', addedHeroIds?: string[], removedHeroIds?: string[]) => {
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
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showError = (message: string) => addToast(message, 'error');
  const showSuccess = (message: string) => addToast(message, 'success');
  const showWarning = (message: string) => addToast(message, 'warning');
  const showInfo = (message: string, addedHeroIds?: string[], removedHeroIds?: string[]) => {
    console.log('[showInfo被调用]', { message, addedHeroIds, removedHeroIds });
    return addToast(message, 'info', addedHeroIds, removedHeroIds);
  };

  const clearAll = () => {
    setToasts([]);
  };

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