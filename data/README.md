# 英雄数据配置说明

## 📁 文件结构
```
data/
├── heroes.ts        # 英雄数据配置文件
└── README.md         # 本说明文件
```

## 🦸‍♂️ 英雄数据结构

每个英雄包含以下字段：

```typescript
interface Hero {
  id: string;         // 英雄唯一标识符
  name: string;       // 英文名称
  cnName: string;     // 中文名称
  nickname?: string;  // 昵称/俗称（可选）
  role: HeroRole;     // 角色：CAPTAIN/JUNGLE/CARRY
  attackType: AttackType; // 攻击类型：MELEE/RANGED
  imageIndex?: number; // 备用图片索引
  avatar?: string;    // 自定义头像URL（可选）
}
```

## 📊 数据分类

### Captains (指挥官/辅助) - 14个
负责保护团队、提供控制和治疗。

### Jungle (打野) - 18个
负责发育、gank和控制地图。

### Carries (对线/核心) - 26个
主要输出伤害，负责后期团战。

## 🔧 实用功能

### 搜索功能
支持按以下字段搜索：
- 英文名称
- 中文名称
- 昵称

### 头像获取
```typescript
// 自动生成OSS地址
getHeroAvatarUrl(hero, ossBaseUrl)
// 结果: https://your-oss-bucket.oss-region.aliyuncs.com/heroes/adagio.jpg
```

### 按角色分组
```typescript
// 获取指定角色的所有英雄
HEROES_BY_ROLE[HeroRole.CAPTAIN]
```

## 📝 添加新英雄

1. **添加到 HEROES_DATA 数组**：
```typescript
{
  id: 'newhero',
  name: 'NewHero',
  cnName: '新英雄',
  nickname: '昵称',
  role: HeroRole.CARRY,
  attackType: AttackType.RANGED,
}
```

2. **上传头像**：
- 文件名：`newhero.jpg`
- 路径：`/heroes/`

## 🌐 OSS 配置

在 App.tsx 中修改：
```typescript
const OSS_BASE_URL = 'https://your-bucket.oss-region.aliyuncs.com';
```

## 🔄 数据同步

当修改英雄数据时：
1. 更新 `data/heroes.ts` 文件
2. 重新构建项目
3. 部署到 GitHub Pages

## 📱 昵称规则

- **简洁性**：1-3个字符
- **易记性**：常用简称或特征
- **独特性**：避免与其他英雄冲突
- **玩家习惯**：使用游戏社区常用称呼

## ⚡ 性能优化

- 使用 useMemo 缓存搜索结果
- 使用 useCallback 优化事件处理
- 按角色分组减少计算量

## 🔍 数据验证

可以添加验证函数确保数据完整性：
```typescript
const validateHeroData = (heroes: Hero[]) => {
  const ids = heroes.map(h => h.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    console.error('发现重复的英雄ID');
  }

  return uniqueIds.size === heroes.length;
};
```