// 从英雄数据文件导入
export { HEROES_DATA as HEROES } from './data/heroes';

// 重新导出类型和枚举
export type { Hero, AttackType } from './types';
export { HeroRole } from './types';

// 导入必要的类型用于函数定义
import type { Hero as ImportedHero, HeroRole as ImportedHeroRole } from './types';
import { HEROES_DATA } from './data/heroes';

// Utility functions
export const filterHeroesByRole = (heroes: ImportedHero[], role: ImportedHeroRole): ImportedHero[] => {
  return heroes.filter(hero => hero.role === role);
};

export const filterAvailableHeroes = (heroes: ImportedHero[], selectedIds: Set<string>): ImportedHero[] => {
  return heroes.filter(hero => !selectedIds.has(hero.id));
};