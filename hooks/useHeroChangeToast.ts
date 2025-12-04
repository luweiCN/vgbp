import { useEffect, useRef } from 'react';
import { getHeroById } from '../data/heroes';



export const useHeroChangeToast = (
  selectedHeroes: Set<string>,
  onShowToast: (message: string, addedHeroIds: string[], removedHeroIds: string[]) => void
): void => {
  // 用于跟踪上一次的英雄选择状态，用于diff计算
  const previousHeroesRef = useRef<Set<string>>(new Set());
  const lastDiffRef = useRef<string>('');
  const isProcessingRef = useRef(false);

  // 监听selectedHeroes变化，计算diff
  useEffect(() => {
    // 防止重复处理
    if (isProcessingRef.current) {
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
        message = addedCount <= 3 
          ? `房间新增了英雄：${addedHeroes.slice(0, 3).map(heroId => getHeroById(heroId)?.cnName).join('、')}${addedCount > 3 ? '等' : ''}`
          : `房间新增了${addedCount}个英雄`;
      } else if (removedCount > 0 && addedCount === 0) {
        message = removedCount <= 3 
          ? `房间取消了英雄：${removedHeroes.slice(0, 3).map(heroId => getHeroById(heroId)?.cnName).join('、')}${removedCount > 3 ? '等' : ''}`
          : `房间取消了${removedCount}个英雄`;
      } else if (addedCount > 0 && removedCount > 0) {
        const addedNames = addedHeroes.slice(0, 3).map(heroId => getHeroById(heroId)?.cnName).join('、');
        const removedNames = removedHeroes.slice(0, 3).map(heroId => getHeroById(heroId)?.cnName).join('、');
        message = `房间英雄变化：新增${addedNames}${addedCount > 3 ? '等' : ''}，取消${removedNames}${removedCount > 3 ? '等' : ''}`;
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