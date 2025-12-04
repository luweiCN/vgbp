# 技术设计文档: 多语言支持系统

## 架构概览

### 设计原则
1. **轻量级**: 自实现国际化系统，避免重型i18n库依赖
2. **可扩展**: 支持未来添加更多语言的架构设计
3. **性能优化**: 懒加载、缓存机制、按需加载
4. **类型安全**: 完整TypeScript类型定义
5. **用户友好**: 中文优先，英文友好的体验设计

### 技术栈
- **前端框架**: React 19.2.0 + TypeScript
- **状态管理**: React Context + Hooks
- **数据存储**: localStorage + 内存缓存
- **文件格式**: JSON语言包
- **构建工具**: Vite 6.2.0

## 系统架构

### 核心组件架构

```
src/i18n/
├── types/
│   └── index.ts                 # TypeScript类型定义
├── services/
│   ├── i18n.service.ts          # 核心国际化服务
│   ├── heroLocalization.service.ts  # 英雄本地化服务
│   └── multilingualSearch.service.ts # 多语言搜索服务
├── hooks/
│   └── useI18n.ts               # React Hook
├── components/
│   ├── I18nProvider.tsx         # Context Provider
│   └── LanguageSelector.tsx     # 语言选择器组件
├── locales/
│   ├── zh-CN.json              # 中文语言包
│   └── en-US.json              # 英文语言包
└── hero-data/
    ├── zh-CN.json              # 中文英雄本地化数据
    └── en-US.json              # 英文英雄本地化数据
```

### 数据流架构

```
用户操作 → LanguageSelector → I18nService →
Language Context → React组件 → UI更新
     ↑                ↓
localStorage ← 语言偏好持久化
```

## 核心服务设计

### 1. I18nService (i18n.service.ts)

**职责**: 核心国际化服务，提供语言管理和翻译功能

```typescript
interface I18nService {
  // 语言管理
  getCurrentLanguage(): Language;
  setLanguage(language: Language): Promise<void>;
  getSupportedLanguages(): Language[];

  // 翻译功能
  translate(key: string, params?: Record<string, any>): string;
  translatePlural(key: string, count: number, params?: Record<string, any>): string;

  // 语言包管理
  loadLanguagePack(language: Language): Promise<LanguagePack>;
  preloadLanguagePack(language: Language): Promise<void>;

  // 缓存管理
  clearCache(): void;
  getCacheStats(): CacheStats;
}
```

**关键特性**:
- 语言包懒加载和预加载
- 多层缓存策略（内存 + localStorage）
- 参数化翻译支持
- 复数形式处理

### 2. HeroLocalizationService (heroLocalization.service.ts)

**职责**: 英雄数据的本地化处理和昵称管理

```typescript
interface HeroLocalizationService {
  // 英雄名称本地化
  getHeroDisplayName(hero: Hero, language: Language): string;
  getHeroNickname(hero: Hero, language: Language): string | null;

  // 英雄描述本地化
  getHeroRoleDescription(role: HeroRole, language: Language): string;
  getHeroAttackTypeDescription(attackType: AttackType, language: Language): string;

  // 昵称处理逻辑
  shouldShowNickname(hero: Hero, language: Language): boolean;
  getLocalizedHeroInfo(hero: Hero, language: Language): LocalizedHeroInfo;
}
```

**昵称处理策略**:
- **中文环境 (zh-CN)**: 显示中文名 + 昵称
- **英文环境 (en-US)**: 只显示英文名，隐藏昵称

### 3. MultilingualSearchService (multilingualSearch.service.ts)

**职责**: 多语言搜索功能增强

```typescript
interface MultilingualSearchService {
  // 搜索功能
  searchHeroes(heroes: Hero[], query: string, language: Language): Hero[];
  searchWithSuggestions(query: string, language: Language): SearchSuggestion[];

  // 搜索索引
  buildSearchIndex(heroes: Hero[], language: Language): SearchIndex;
  updateSearchIndex(heroes: Hero[], language: Language): void;

  // 搜索优化
  getSearchHighlights(text: string, query: string): HighlightRange[];
  rankSearchResults(results: Hero[], query: string, language: Language): Hero[];
}
```

**搜索策略**:
- **中文环境**: 中文名 + 昵称 + 拼音搜索
- **英文环境**: 英文名 + 模糊匹配
- **混合环境**: 中英文 + 拼音 + 模糊匹配

## React集成设计

### 1. I18nProvider (I18nProvider.tsx)

**职责**: React Context Provider，提供全局国际化状态

```typescript
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  fallbackLanguage?: Language;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  translate: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  isReady: boolean;
}
```

**特性**:
- 语言切换全局状态管理
- 异步语言包加载状态
- 错误处理和回退机制
- 性能优化（React.memo）

### 2. useI18n Hook (useI18n.ts)

**职责**: 提供便捷的国际化Hook接口

```typescript
interface UseI18nReturn {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, count: number, params?: Record<string, any>) => string;
  isLanguageReady: boolean;
  formatMessage: (key: string, values?: Record<string, React.ReactNode>) => React.ReactNode;
}
```

### 3. LanguageSelector (LanguageSelector.tsx)

**职责**: 语言切换UI组件

```typescript
interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showNativeName?: boolean;
  position?: 'header' | 'footer' | 'sidebar';
}
```

**特性**:
- 统一的视觉设计
- 支持不同显示位置
- 无障碍访问支持
- 响应式设计

## 数据结构设计

### 1. 语言包结构

```typescript
interface LanguagePack {
  meta: {
    language: Language;
    version: string;
    lastUpdated: string;
  };
  translations: {
    // UI组件文本
    ui: {
      common: Record<string, string>;
      components: Record<string, Record<string, string>>;
    };

    // 操作按钮
    actions: Record<string, string>;

    // 状态信息
    status: Record<string, string>;

    // 角色分类
    roles: Record<HeroRole, string>;

    // 表单标签
    forms: Record<string, {
      label: string;
      placeholder?: string;
      help?: string;
      validation?: Record<string, string>;
    }>;

    // 动态消息
    messages: Record<string, string>;
  };
}
```

### 2. 英雄本地化数据结构

```typescript
interface HeroLocalizationData {
  [heroId: string]: {
    displayName?: string;
    nickname?: string;
    description?: string;
    roleDescription?: string;
    tips?: string[];
  };
}
```

### 3. 键值对命名规范

```typescript
// 组件级命名
ui.{componentName}.{elementName}
// 例: ui.heroCard.selected, ui.entryPage.title

// 通用操作
actions.{actionName}
// 例: actions.resetBP, actions.createRoom

// 状态信息
status.{statusName}
// 例: status.loading, status.syncing

// 角色分类
roles.{roleName}
// 例: roles.captain, roles.jungle, roles.carry

// 表单标签
forms.{formName}.{fieldType}
// 例: forms.room.name.label, forms.auth.email.placeholder
```

## 性能优化策略

### 1. 语言包懒加载

```typescript
// 按需加载语言包
const loadLanguagePack = async (language: Language): Promise<LanguagePack> => {
  // 1. 检查内存缓存
  if (memoryCache[language]) return memoryCache[language];

  // 2. 检查localStorage缓存
  const cached = localStorage.getItem(`i18n-${language}`);
  if (cached) return JSON.parse(cached);

  // 3. 网络加载
  const response = await fetch(`/i18n/locales/${language}.json`);
  const pack = await response.json();

  // 4. 缓存结果
  memoryCache[language] = pack;
  localStorage.setItem(`i18n-${language}`, JSON.stringify(pack));

  return pack;
};
```

### 2. 搜索索引优化

```typescript
// 构建优化的搜索索引
class SearchIndex {
  private index: Map<string, Set<string>> = new Map();

  buildIndex(heroes: Hero[], language: Language): void {
    heroes.forEach(hero => {
      const keys = this.extractSearchKeys(hero, language);
      keys.forEach(key => {
        if (!this.index.has(key)) {
          this.index.set(key, new Set());
        }
        this.index.get(key)!.add(hero.id);
      });
    });
  }

  search(query: string): string[] {
    const normalized = query.toLowerCase().trim();
    const results = this.index.get(normalized);
    return results ? Array.from(results) : [];
  }
}
```

### 3. React性能优化

```typescript
// 使用React.memo优化组件渲染
const HeroCard = React.memo<HeroCardProps>(({ hero, language }) => {
  const displayName = useHeroDisplayName(hero, language);
  const shouldShowNickname = useShouldShowNickname(language);

  return (
    <div className="hero-card">
      <h3>{displayName}</h3>
      {shouldShowNickname && hero.nickname && (
        <span className="nickname">{hero.nickname}</span>
      )}
    </div>
  );
});

// 使用useMemo缓存计算结果
const useLocalizedHeroes = (heroes: Hero[], language: Language) => {
  return useMemo(() => {
    return heroes.map(hero => ({
      ...hero,
      displayName: getHeroDisplayName(hero, language),
      nickname: getLocalizedNickname(hero, language)
    }));
  }, [heroes, language]);
};
```

## 错误处理与回退机制

### 1. 语言包加载失败处理

```typescript
const loadLanguageWithFallback = async (language: Language): Promise<LanguagePack> => {
  try {
    return await loadLanguagePack(language);
  } catch (error) {
    console.warn(`Failed to load language pack for ${language}, falling back to zh-CN`);
    return await loadLanguagePack('zh-CN');
  }
};
```

### 2. 翻译键缺失处理

```typescript
const translateWithFallback = (
  key: string,
  language: Language,
  fallback: string = key
): string => {
  const translation = getTranslation(key, language);
  if (translation) return translation;

  // 回退到默认语言
  const fallbackTranslation = getTranslation(key, 'zh-CN');
  if (fallbackTranslation) return fallbackTranslation;

  // 最后回退到键名
  return fallback;
};
```

## 测试策略

### 1. 单元测试
- i18n.service.ts 核心功能测试
- 语言包加载和缓存测试
- 翻译功能测试
- 英雄本地化功能测试

### 2. 集成测试
- React组件多语言渲染测试
- 语言切换功能测试
- 搜索功能多语言测试
- 性能基准测试

### 3. 端到端测试
- 完整用户流程测试
- 多语言界面显示测试
- 浏览器兼容性测试

## 部署考虑

### 1. 静态资源部署
- 语言包文件部署到CDN
- 版本控制和缓存策略
- 压缩和优化

### 2. 运行时配置
- 默认语言配置
- 语言检测策略
- 错误监控

### 3. 监控指标
- 语言包加载时间
- 语言切换成功率
- 翻译缺失率
- 性能影响指标

---

**文档版本**: 1.0
**最后更新**: 2025-12-04
**负责人**: Claude AI Assistant