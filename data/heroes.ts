import { Hero, HeroRole, AttackType } from "../types";
import { pinyin } from "pinyin-pro";

// 英雄数据配置
export const HEROES_DATA: Hero[] = [
  // ===== Captains (指挥官/辅助) =====
  {
    id: "adagio",
    name: "Adagio",
    cnName: "天使 奥达基",
    nickname: "鸟人",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
    imageIndex: 1,
  },
  {
    id: "ardan",
    name: "Ardan",
    cnName: "护卫 亚丹",
    nickname: "二蛋",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 4,
  },
  {
    id: "catherine",
    name: "Catherine",
    cnName: "战警 凯瑟琳",
    nickname: "女警",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 8,
  },
  {
    id: "churnwalker",
    name: "Churnwalker",
    cnName: "混沌行者 沃克尔",
    nickname: "钩子",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 10,
  },
  {
    id: "flicker",
    name: "Flicker",
    cnName: "精灵闪光 弗利克",
    nickname: "小精灵",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 11,
  },
  {
    id: "fortress",
    name: "Fortress",
    cnName: "魔狼 福彻斯",
    nickname: "",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 12,
  },
  {
    id: "grace",
    name: "Grace",
    cnName: "圣骑士 格瑞丝",
    nickname: "锤妈",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 14,
  },
  {
    id: "lance",
    name: "Lance",
    cnName: "古骑士 兰斯",
    nickname: "光头",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
    imageIndex: 26,
  },
  {
    id: "lorelai",
    name: "Lorelai",
    cnName: "碧海歌妖 洛姬",
    nickname: "蛇女",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
    imageIndex: 28,
  },
  {
    id: "lyra",
    name: "Lyra",
    cnName: "金灯 莱拉",
    nickname: "",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.RANGED,
    imageIndex: 29,
  },
  {
    id: "phinn",
    name: "Phinn",
    cnName: "鱼人 费恩",
    nickname: "",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
    imageIndex: 35,
  },
  {
    id: "viola",
    name: "Viola",
    cnName: "吟游歌手 维奥拉",
    nickname: "琴女",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.RANGED,
    imageIndex: 48,
  },
  {
    id: "yates",
    name: "Yates",
    cnName: "全能战将 耶茨",
    nickname: "椰子",
    role: HeroRole.CAPTAIN,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
    imageIndex: 51,
  },

  // ===== Jungle (打野) =====
  {
    id: "alpha",
    name: "Alpha",
    cnName: "机械战姬 阿尔法",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "glaive",
    name: "Glaive",
    cnName: "盲豹 格雷",
    nickname: "豹子",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "grumpjaw",
    name: "Grumpjaw",
    cnName: "大嘴怪 格兰卓",
    nickname: "大嘴",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "inara",
    name: "Inara",
    cnName: "森林守护者 依娜",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "joule",
    name: "Joule",
    cnName: "机甲 朱尔",
    nickname: "珠儿，猪儿",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "koshka",
    name: "Koshka",
    cnName: "猫女 柯思卡",
    nickname: "猫女",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "krul",
    name: "Krul",
    cnName: "鬼剑 骷髅",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "ozo",
    name: "Ozo",
    cnName: "灵猴 奥佐",
    nickname: "猴子",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "petal",
    name: "Petal",
    cnName: "花妖 佩兔",
    nickname: "花花",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "reim",
    name: "Reim",
    cnName: "冰法 莱姆",
    nickname: "老头",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "rona",
    name: "Rona",
    cnName: "狂战士 罗娜",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "shin",
    name: "Shin",
    cnName: "莲花太子 哪吒",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "taka",
    name: "Taka",
    cnName: "隐狐 塔卡",
    nickname: "狐狸",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "tony",
    name: "Tony",
    cnName: "破碎重拳 托尼",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "ylva",
    name: "Ylva",
    cnName: "荒野猎手 伊娃",
    nickname: "",
    role: HeroRole.JUNGLE,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },

  // ===== Carries (对线/核心) =====
  {
    id: "amael",
    name: "Amalel",
    cnName: "摔跤之王 阿玛尔",
    nickname: "牛头",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "anka",
    name: "Anka",
    cnName: "刀锋魅影 安卡",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "baptiste",
    name: "Baptiste",
    cnName: "巫毒师 巴蒂斯特",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "baron",
    name: "Baron",
    cnName: "星际战士 巴隆",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "blackfeather",
    name: "Blackfeather",
    cnName: "剑客 黑羽",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "caine",
    name: "Caine",
    cnName: "神枪手 凯恩",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "celeste",
    name: "Celeste",
    cnName: "魔女 星乐斯",
    nickname: "星妈，塞莱斯特",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "gwen",
    name: "Gwen",
    cnName: "荒野牛仔 格温",
    nickname: "女枪",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "idris",
    name: "Idris",
    cnName: "沙漠之鹰 伊德瑞",
    nickname: "沙鹰",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "ishtar",
    name: "Ishtar",
    cnName: "恶魔之刃 伊丝塔",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "karas",
    name: "Karas",
    cnName: "风暴之子 鸦",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "kensei",
    name: "Kensei",
    cnName: "剑圣 肯赛",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "kestrel",
    name: "Kestrel",
    cnName: "鹰眼 凯思卓",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "kinetic",
    name: "Kinetic",
    cnName: "源动战士 基尼",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "leo",
    name: "Leo",
    cnName: "黑腕死神 里昂",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "magnus",
    name: "Magnus",
    cnName: "奥术贤王 玛格纳斯",
    nickname: "马哥",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "malene",
    name: "Malene",
    cnName: "双面公主 梅兰妮",
    nickname: "小公主",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "miho",
    name: "Miho",
    cnName: "新月剑客 美惠",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "reza",
    name: "Reza",
    cnName: "火焰法师 雷萨",
    nickname: "火法",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "ringo",
    name: "Ringo",
    cnName: "醉枪手 林戈",
    nickname: "酒枪",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "samuel",
    name: "Samuel",
    cnName: "黑暗法师 萨缪尔",
    nickname: "黑法",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "sanfeng",
    name: "Sanfeng",
    cnName: "太极宗师 三风",
    nickname: "三丰",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CAPTAIN],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE],
    attackType: AttackType.MELEE,
  },
  {
    id: "saw",
    name: "Saw",
    cnName: "机枪 索尔",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.MELEE,
  },
  {
    id: "silvernail",
    name: "Silvernail",
    cnName: "银钉猎人 西弗尔",
    nickname: "媳妇儿",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CAPTAIN, HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "skaarf",
    name: "Skaarf",
    cnName: "火龙 史卡夫",
    nickname: "小火龙",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "skye",
    name: "Skye",
    cnName: "战擎 丝凯伊",
    nickname: "",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.JUNGLE],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "varya",
    name: "Varya",
    cnName: "风暴公主 瓦妮亚",
    nickname: "雷妈，雷法",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "vox",
    name: "Vox",
    cnName: "音速 舞司",
    nickname: "沃克斯，耳机",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
  {
    id: "warhawk",
    name: "Warhawk",
    cnName: "火箭小子 尼尔",
    nickname: "小炮",
    role: HeroRole.CARRY,
    commonRoles: [HeroRole.CARRY],
    flexRoles: [HeroRole.JUNGLE, HeroRole.CARRY],
    attackType: AttackType.RANGED,
  },
];

// 按角色分组的英雄数据（按官方定位）
export const HEROES_BY_ROLE = {
  [HeroRole.CAPTAIN]: HEROES_DATA.filter(
    (hero) => hero.role === HeroRole.CAPTAIN,
  ),
  [HeroRole.JUNGLE]: HEROES_DATA.filter(
    (hero) => hero.role === HeroRole.JUNGLE,
  ),
  [HeroRole.CARRY]: HEROES_DATA.filter((hero) => hero.role === HeroRole.CARRY),
};

// 按常用位置分组的英雄数据（基于玩家实际使用习惯）
export const HEROES_BY_COMMON_ROLE = {
  [HeroRole.CAPTAIN]: HEROES_DATA.filter(
    (hero) => !hero.commonRoles || hero.commonRoles.includes(HeroRole.CAPTAIN),
  ),
  [HeroRole.JUNGLE]: HEROES_DATA.filter(
    (hero) => !hero.commonRoles || hero.commonRoles.includes(HeroRole.JUNGLE),
  ),
  [HeroRole.CARRY]: HEROES_DATA.filter(
    (hero) => !hero.commonRoles || hero.commonRoles.includes(HeroRole.CARRY),
  ),
};

// 按flex角色分组的英雄数据（按理论上可以打的位置）
export const HEROES_BY_FLEX_ROLE = {
  [HeroRole.CAPTAIN]: HEROES_DATA.filter(
    (hero) => !hero.flexRoles || hero.flexRoles.includes(HeroRole.CAPTAIN),
  ),
  [HeroRole.JUNGLE]: HEROES_DATA.filter(
    (hero) => !hero.flexRoles || hero.flexRoles.includes(HeroRole.JUNGLE),
  ),
  [HeroRole.CARRY]: HEROES_DATA.filter(
    (hero) => !hero.flexRoles || hero.flexRoles.includes(HeroRole.CARRY),
  ),
};

// 分类模式枚举
export enum ClassificationMode {
  OFFICIAL = "official", // 官方定位
  COMMON = "common", // 常用位置
  FLEX = "flex", // 灵活位置
}

// 获取按指定方式分组的英雄数据
export const getHeroesByRole = (
  mode: ClassificationMode = ClassificationMode.OFFICIAL,
) => {
  switch (mode) {
    case ClassificationMode.COMMON:
      return HEROES_BY_COMMON_ROLE;
    case ClassificationMode.FLEX:
      return HEROES_BY_FLEX_ROLE;
    case ClassificationMode.OFFICIAL:
    default:
      return HEROES_BY_ROLE;
  }
};

// 直接使用 Vercel Blob URL（暂时方案）
const VERCEL_BLOB_BASE_URL = 'https://nksf7fmzcvduehht.public.blob.vercel-storage.com/heroes';

// 获取英雄头像URL的函数
export const getHeroAvatarUrl = (hero: Hero, ossBaseUrl?: string): string => {
  // 优先使用英雄自定义头像
  if (hero.avatar) {
    return hero.avatar;
  }

  // 如果提供了自定义 OSS URL（向后兼容）
  if (ossBaseUrl) {
    return `${ossBaseUrl}/${hero.id}.jpg`;
  }

  // 默认使用 Vercel Blob
  return `${VERCEL_BLOB_BASE_URL}/${hero.id}.jpg`;
};

// 模糊搜索函数 - 支持不连续字符匹配
const fuzzyMatch = (text: string, pattern: string): boolean => {
  if (!pattern) return true;
  if (!text) return false;

  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();

  let textIndex = 0;
  let patternIndex = 0;

  while (textIndex < textLower.length && patternIndex < patternLower.length) {
    if (textLower[textIndex] === patternLower[patternIndex]) {
      patternIndex++;
    }
    textIndex++;
  }

  return patternIndex === patternLower.length;
};

// 搜索英雄的函数（支持拼音搜索和模糊搜索）
export const searchHeroes = (heroes: Hero[], searchTerm: string): Hero[] => {
  if (!searchTerm.trim()) return heroes;

  return heroes.filter((hero) => {
    // 1. 英文名称模糊匹配（支持不连续字符）
    const nameMatch = fuzzyMatch(hero.name, searchTerm);

    // 2. 中文名称模糊匹配（支持不连续字符）
    const cnNameMatch = fuzzyMatch(hero.cnName, searchTerm);

    // 3. 昵称模糊匹配（支持不连续字符）
    const nicknameMatch = hero.nickname
      ? fuzzyMatch(hero.nickname, searchTerm)
      : false;

    // 4. 中文名称拼音匹配（支持不连续字符）
    let cnPinyinMatch = false;
    try {
      const cnPinyin = pinyin(hero.cnName, {
        toneType: "none",
        type: "string",
      });
      cnPinyinMatch = fuzzyMatch(cnPinyin, searchTerm);
    } catch (error) {
      // 如果拼音转换失败，忽略错误
    }

    // 5. 昵称拼音匹配（支持不连续字符）
    let nicknamePinyinMatch = false;
    if (hero.nickname) {
      try {
        const nicknamePinyin = pinyin(hero.nickname, {
          toneType: "none",
          type: "string",
        });
        nicknamePinyinMatch = fuzzyMatch(nicknamePinyin, searchTerm);
      } catch (error) {
        // 如果拼音转换失败，忽略错误
      }
    }

    return (
      nameMatch ||
      cnNameMatch ||
      nicknameMatch ||
      cnPinyinMatch ||
      nicknamePinyinMatch
    );
  });
};
