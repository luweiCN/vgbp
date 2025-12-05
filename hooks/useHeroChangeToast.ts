import { useEffect, useRef } from 'react';
import { getHeroById } from '@/data/heroes';
import { Language } from '@/types';


export const useHeroChangeToast = (
  selectedHeroes: Set<string>,
  onShowToast: (message: string, addedHeroIds: string[], removedHeroIds: string[]) => void,
  t: (key: string, params?: Record<string, any>) => string,
  isReady: boolean = true,
  language: Language = 'zh-CN'
): void => {
  // 用于跟踪上一次的英雄选择状态，用于diff计算
  const previousHeroesRef = useRef<Set<string>>(new Set());
  const lastDiffRef = useRef<string>('');
  const isProcessingRef = useRef(false);

  // 监听selectedHeroes变化，计算diff
  useEffect(() => {
    // 防止重复处理
    if (isProcessingRef.current || !isReady) {
      return;
    }

    const currentHeroesSet = selectedHeroes;
    const previousHeroesSet = previousHeroesRef.current;
    
    // 计算diff
    const currentHeroesArray: string[] = Array.from(currentHeroesSet);
    const previousHeroesArray: string[] = Array.from(previousHeroesSet);
    const addedHeroes: string[] = currentHeroesArray.filter(heroId => !previousHeroesSet.has(heroId));
    const removedHeroes: string[] = previousHeroesArray.filter(heroId => !currentHeroesSet.has(heroId));
    
    // 如果有变化，计算Toast信息
    if (addedHeroes.length > 0 || removedHeroes.length > 0) {
      const addedCount = addedHeroes.length;
      const removedCount = removedHeroes.length;
      let message = '';

      if (addedCount > 0 && removedCount === 0) {
        if (addedCount <= 3) {
          const names = addedHeroes.slice(0, 3).map(heroId => {
            const hero = getHeroById(heroId);
            return language === 'zh-CN' ? hero?.cnName : hero?.name;
          }).join('、');
          const hasMore = addedCount > 3;
          const suffix = hasMore ? (language === 'zh-CN' ? '等' : ' & more') : '';
          message = language === 'zh-CN'
            ? `新增英雄：${names}${suffix}`
            : `Added: ${names}${suffix}`;
        } else {
          message = t('ui.components.heroChangeToast.addedWithCount', { count: addedCount });
        }
      } else if (removedCount > 0 && addedCount === 0) {
        if (removedCount <= 3) {
          const names = removedHeroes.slice(0, 3).map(heroId => {
            const hero = getHeroById(heroId);
            return language === 'zh-CN' ? hero?.cnName : hero?.name;
          }).join('、');
          const hasMore = removedCount > 3;
          const suffix = hasMore ? (language === 'zh-CN' ? '等' : ' & more') : '';
          message = language === 'zh-CN'
            ? `取消英雄：${names}${suffix}`
            : `Removed: ${names}${suffix}`;
        } else {
          message = t('ui.components.heroChangeToast.removedWithCount', { count: removedCount });
        }
      } else if (addedCount > 0 && removedCount > 0) {
        const addedNames = addedHeroes.slice(0, 3).map(heroId => {
          const hero = getHeroById(heroId);
          return language === 'zh-CN' ? hero?.cnName : hero?.name;
        }).join('、');
        const removedNames = removedHeroes.slice(0, 3).map(heroId => {
          const hero = getHeroById(heroId);
          return language === 'zh-CN' ? hero?.cnName : hero?.name;
        }).join('、');
        const addedSuffix = addedCount > 3 ? (language === 'zh-CN' ? '等' : ' & more') : '';
        const removedSuffix = removedCount > 3 ? (language === 'zh-CN' ? '等' : ' & more') : '';
        message = language === 'zh-CN'
          ? `英雄变化：新增${addedNames}${addedSuffix}，取消${removedNames}${removedSuffix}`
          : `Changed: Added ${addedNames}${addedSuffix}, Removed ${removedNames}${removedSuffix}`;
      }

      // 创建diff标识
      const diffKey = `${addedHeroes.join(',')}-${removedHeroes.join(',')}`;
      
      // 只有当diff与上次不同时才显示Toast
      if (diffKey !== lastDiffRef.current) {
        // 标记正在处理
        isProcessingRef.current = true;
        
        const addedHeroIds = addedHeroes.slice(0, 5);
        const removedHeroIds = removedHeroes.slice(0, 5);
        
        // 调用回调显示Toast
        onShowToast(message, addedHeroIds, removedHeroIds);
        lastDiffRef.current = diffKey;
        
        // 延迟重置处理标记，防止快速连续变化
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
      }
    }
    
    // 更新ref
    previousHeroesRef.current = new Set(currentHeroesSet);
  }, [selectedHeroes, onShowToast]);
};