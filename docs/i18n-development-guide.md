# 多语言开发指南

本文档为 Vainglory Draft Assistant 项目的多语言开发指南，帮助开发者在开发新功能时正确实现国际化支持。

## 项目多语言架构概述

### 技术栈
- **框架**: 自研 i18n 系统，基于 React Context
- **语言**: 中文(zh-CN) - 主要语言，英文(en-US) - 次要语言
- **性能**: 语言包预加载（preload/prefetch）
- **持久化**: localStorage 保存用户语言偏好

### 文件结构
```
/i18n/
├── services/
│   └── i18n.service.ts      # 核心 i18n 服务
├── components/
│   ├── I18nProvider.tsx     # Context Provider
│   └── LanguageSelector.tsx # 语言切换器组件
└── types.ts                 # TypeScript 类型定义

/public/i18n/locales/
├── zh-CN.json               # 中文语言包
└── en-US.json               # 英文语言包
```

## 开发新功能的多语言实现步骤

### 1. 确定需要国际化的文本
在编写组件时，识别所有用户可见的文本：
- 按钮文字
- 标签和标题
- 错误消息
- 提示信息
- 占位符文本
- 表单验证消息

### 2. 添加翻译键到语言包

#### 中文翻译包 (`/public/i18n/locales/zh-CN.json`)
```json
{
  "ui": {
    "common": {
      "confirm": "确认",
      "cancel": "取消",
      "save": "保存"
    },
    "newFeature": {
      "title": "新功能",
      "description": "这是一个新功能的描述",
      "successMessage": "操作成功！"
    }
  }
}
```

#### 英文翻译包 (`/public/i18n/locales/en-US.json`)
```json
{
  "ui": {
    "common": {
      "confirm": "Confirm",
      "cancel": "Cancel",
      "save": "Save"
    },
    "newFeature": {
      "title": "New Feature",
      "description": "This is a description of the new feature",
      "successMessage": "Operation successful!"
    }
  }
}
```

### 3. 在组件中使用翻译

```typescript
import React from 'react';
import { useI18n } from '@/i18n/components/I18nProvider';

const NewFeatureComponent = () => {
  const { t } = useI18n();

  return (
    <div>
      <h2>{t('ui.newFeature.title')}</h2>
      <p>{t('ui.newFeature.description')}</p>
      <button>{t('ui.common.confirm')}</button>
      <button>{t('ui.common.cancel')}</button>
    </div>
  );
};

export default React.memo(NewFeatureComponent);
```

### 4. 处理动态文本和参数

#### 使用参数化翻译
```json
// 语言包
{
  "hero": {
    "selectedCount": "已选择 {{count}} 个英雄",
    "remainingSlots": "还剩 {{remaining}} 个位置"
  }
}
```

```typescript
// 组件中使用
const { t } = useI18n();
const message = t('hero.selectedCount', { count: 5 });
```

#### 处理复数形式
```typescript
import { useI18n } from '@/i18n/components/I18nProvider';

const { tc } = useI18n();

// 根据数量自动选择正确的翻译
const message = tc('items.count', itemCount, { count: itemCount });
```

### 5. 表单验证和错误消息

```typescript
const validateForm = (data: FormData) => {
  const errors: string[] = [];

  if (!data.email) {
    errors.push(t('error.email.required'));
  }

  if (!data.password) {
    errors.push(t('error.password.required'));
  }

  return errors;
};
```

## 翻译键命名规范

### 命名规则
- 使用层级结构，用点号分隔
- 格式：`模块.组件.功能.具体文本`
- 全部使用小写字母和驼峰命名

### 示例
```
✅ 好的命名
- ui.common.confirm
- ui.roomList.filter.searchPlaceholder
- hero.modal.reset.warning
- error.auth.invalidCredentials
- navigation.items.home

❌ 避免的命名
- confirm （太简单，容易冲突）
- UI_Common_Confirm （不一致的风格）
- very.deep.nested.key.structure.which.is.hard.to.read （过深）
```

### 模块分类
- `ui.*` - UI 界面文本
- `error.*` - 错误消息
- `success.*` - 成功消息
- `navigation.*` - 导航相关
- `hero.*` - 英雄相关功能
- `room.*` - 房间相关功能

## 性能优化指南

### 1. 组件优化
```typescript
import React, { memo, useMemo } from 'react';
import { useI18n } from '@/i18n/components/I18nProvider';

const OptimizedComponent = memo(({ data }) => {
  const { t } = useI18n();

  // 缓存翻译结果
  const title = useMemo(() => t('ui.component.title'), [t]);

  return <h1>{title}</h1>;
});
```

### 2. 避免重复的翻译调用
```typescript
// ❌ 错误 - 每次渲染都调用
{items.map(item => (
  <li key={item.id}>
    {t('ui.item.name', { name: item.name })} {/* 每次都调用翻译函数 */}
  </li>
))}

// ✅ 正确 - 使用 useMemo 缓存
const translatedItems = useMemo(() =>
  items.map(item => ({
    ...item,
    displayName: t('ui.item.name', { name: item.name })
  })), [items, t]);
```

## 测试多语言功能

### 手动测试清单
- [ ] 切换语言后所有文本正确更新
- [ ] 中文环境显示正常，英文环境显示正常
- [ ] 文本长度变化不影响布局
- [ ] 参数化翻译正确显示参数
- [ ] 错误消息在两种语言下都正确
- [ ] 表单验证消息国际化

### 自动化测试示例
```typescript
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/i18n/components/I18nProvider';
import MyComponent from './MyComponent';

test('renders translated text', () => {
  render(
    <I18nProvider language="zh-CN">
      <MyComponent />
    </I18nProvider>
  );

  expect(screen.getByText('确认')).toBeInTheDocument();
});

test('renders English text', () => {
  render(
    <I18nProvider language="en-US">
      <MyComponent />
    </I18nProvider>
  );

  expect(screen.getByText('Confirm')).toBeInTheDocument();
});
```

## 常见问题和解决方案

### Q: 如何处理图标和表情符号？
A: 图标不应放在翻译中，应作为组件的一部分：
```typescript
// ✅ 正确
<button>
  <Icon name="check" />
  {t('ui.common.confirm')}
</button>
```

### Q: 如何处理日期和时间？
A: 使用浏览器的 Intl API：
```typescript
const formatDate = (date: Date) => {
  const { language } = useI18n();
  return new Intl.DateTimeFormat(language).format(date);
};
```

### Q: 如何处理数字格式化？
A: 同样使用 Intl API：
```typescript
const formatNumber = (num: number) => {
  const { language } = useI18n();
  return new Intl.NumberFormat(language).format(num);
};
```

### Q: 翻译键找不到了怎么办？
A: i18n 系统会自动返回键名作为回退，并在开发环境显示警告。

## 维护和更新

### 定期检查
- 确保中英文翻译保持同步
- 检查是否有未使用的翻译键
- 验证翻译的准确性和自然度

### 添加新语言
如果需要支持新语言：
1. 创建新语言包文件
2. 更新类型定义
3. 更新 i18n.service.ts
4. 更新 LanguageSelector 组件
5. 测试所有功能

### 工具和快捷方式
- 使用 VS Code 的多文件编辑功能同时更新两个语言包
- 使用搜索功能查找硬编码的文本
- 使用正则表达式检查未国际化的字符串

## 最佳实践总结

1. **始终保持文本国际化** - 从一开始就使用翻译函数
2. **使用一致的命名规范** - 保持翻译键的可读性和组织性
3. **注意性能** - 合理使用 memo 和 useMemo
4. **全面测试** - 在两种语言下都测试功能
5. **保持同步** - 确保中英文翻译文件保持最新
6. **用户友好** - 提供清晰的错误提示和成功消息

遵循这些指南，可以确保新功能从开始就具备良好的多语言支持。