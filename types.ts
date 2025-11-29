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
  name: string;
  cnName: string; // Chinese Name
  role: HeroRole;
  attackType: AttackType;
  imageIndex: number; // Kept for fallback, though we will try to use real URLs
}

export interface AIAdviceResponse {
  analysis: string;
  suggestedPicks: string[];
  threats: string[];
}