// 从新的英雄数据文件导入
export { HEROES_DATA as HEROES } from './data/heroes';

// 为了向后兼容，重新导出类型
export type { Hero, HeroRole, AttackType } from './types';