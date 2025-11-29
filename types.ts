export enum HeroRole {
  CAPTAIN = 'Captain',
  JUNGLE = 'Jungle',
  CARRY = 'Carry',
}

export enum AttackType {
  MELEE = 'Melee',
  RANGED = 'Ranged',
}

export interface Hero {
  id: string;
  name: string;         // 英文名称
  cnName: string;       // 中文名称
  nickname?: string;    // 昵称/俗称
  role: HeroRole;
  attackType: AttackType;
  imageIndex?: number;  // 保留备用索引
  avatar?: string;      // 头像URL（可选，如果不使用默认规则）
}

export interface AIAdviceResponse {
  analysis: string;
  suggestedPicks: string[];
  threats: string[];
}