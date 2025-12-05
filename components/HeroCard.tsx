import React from 'react';
import { Hero, HeroRole, Language } from '@/types';
import { getHeroAvatarUrl } from '@/data/heroes';
import { useI18n } from '@/i18n/hooks/useI18n';

interface HeroCardProps {
  hero: Hero;
  isSelected: boolean;
  onToggle: (id: string) => void;
  ossBaseUrl?: string; // 保留用于向后兼容，但现在可选
  inModal?: boolean;
  disabled?: boolean;
  isCompactLayout?: boolean;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, isSelected, onToggle, ossBaseUrl, inModal = false, disabled = false, isCompactLayout = false }) => {
  const { language } = useI18n();
  const currentLang = language;

  const handleClick = () => {
    // 在弹窗内或禁用状态下不允许交互
    if (inModal || disabled) return;
    onToggle(hero.id);
  };
  // 使用 Vercel Blob 存储的英雄头像
  const imageUrl = getHeroAvatarUrl(hero, ossBaseUrl);

  // 分离称号和名字
  const parseHeroName = (cnName: string) => {
    const parts = cnName.split(' ');
    if (parts.length >= 2) {
      return {
        title: parts[0], // 称号
        name: parts.slice(1).join(' ') // 名字
      };
    }
    return {
      title: cnName,
      name: ''
    };
  };

  // 根据语言获取显示名称
  const getDisplayName = () => {
    if (currentLang === 'zh-CN') {
      return parseHeroName(hero.cnName);
    }
    // 英文环境只显示英文名
    return {
      title: hero.name.charAt(0).toUpperCase() + hero.name.slice(1).toLowerCase(),
      name: ''
    };
  };

  // 判断是否显示昵称
  const shouldShowNickname = () => {
    return currentLang === 'zh-CN' && hero.nickname;
  };

  const { title, name } = getDisplayName();

  // 紧凑布局时显示的名称（去掉称号，只显示名称）
  const getCompactDisplayName = () => {
    if (currentLang === 'zh-CN') {
      const parsedName = parseHeroName(hero.cnName);
      return parsedName.name || hero.cnName; // 优先显示分离后的名称，如果没有分离则显示全名
    }
    return hero.name.charAt(0).toUpperCase() + hero.name.slice(1).toLowerCase();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative group flex flex-col overflow-hidden transition-all duration-200
        ${isCompactLayout
          ? 'border-0 rounded-none shadow-none'
          : 'border-2 rounded-xl'
        }
        ${isSelected && !inModal
          ? isCompactLayout
            ? 'bg-zinc-900 opacity-60 grayscale cursor-default'
            : 'bg-zinc-900 border-zinc-800 opacity-60 scale-95 grayscale cursor-default shadow-inner'
          : isSelected && inModal
          ? isCompactLayout
            ? 'bg-zinc-800 cursor-default'
            : 'bg-zinc-800 border-zinc-700 cursor-default shadow-md'
          : isCompactLayout
          ? 'hover:scale-105 cursor-pointer'
          : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer shadow-md'
        }
      `}
    >
      {/* Hero Image Container */}
      <div className={`relative w-full aspect-square overflow-hidden`}>
        {/* Background Image */}
        <div className={`absolute inset-0 bg-cover bg-top transition-transform duration-500 ${inModal ? '' : 'group-hover:scale-110'}`}
             style={{
               backgroundImage: `url(${imageUrl})`,
               opacity: isSelected && !inModal ? 0.8 : 1
             }}
        />

        {/* 紧凑布局：英雄名称覆盖层 */}
        {isCompactLayout && (
          <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="text-center text-white w-full">
              <div className="text-xs md:text-sm font-bold truncate leading-tight">
                {getCompactDisplayName()}
              </div>
            </div>
          </div>
        )}

        {/* 非紧凑布局：昵称覆盖层 */}
        {!isCompactLayout && shouldShowNickname() && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-black/10 px-2 py-1">
            <div className="text-center text-[10px] md:text-[11px] text-yellow-300 font-bold tracking-wide truncate">
              {hero.nickname}
            </div>
          </div>
        )}

        {/* Selected Corner Badge (only for main list, not modal) */}
        {isSelected && !inModal && (
          <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
            <div className="bg-red-500 text-white font-bold text-[10px] md:text-xs uppercase tracking-wide px-2 py-1 rounded-bl-lg shadow-lg border border-red-600">
              Picked
            </div>
          </div>
        )}
      </div>

      {/* 非紧凑布局：底部文本内容 */}
      {!isCompactLayout && (
        <div className="w-full p-2 bg-zinc-900/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex flex-col leading-tight">
              {/* 称号或英文名 */}
              <h3 className={`text-[12px] md:text-sm font-bold truncate mb-1 ${isSelected && !inModal ? 'text-zinc-500 line-through' : 'text-white'}`}>
                {currentLang === 'zh-CN' ? title : hero.name.charAt(0).toUpperCase() + hero.name.slice(1).toLowerCase()}
              </h3>

              {/* 中文名 - 只在中文环境显示 */}
              {currentLang === 'zh-CN' && name && (
                <div className={`text-[11px] md:text-xs font-normal truncate opacity-80 ${isSelected && !inModal ? 'text-zinc-600' : 'text-white'}`}>
                  {name}
                </div>
              )}

              {/* 英文名 - 只在中文环境显示 */}
              {currentLang === 'zh-CN' && (
                <span className={`text-[10px] md:text-xs tracking-wide font-semibold truncate ${isSelected && !inModal ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {hero.name.charAt(0).toUpperCase() + hero.name.slice(1).toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </button>
  );
};

export default HeroCard;