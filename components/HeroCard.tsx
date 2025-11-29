import React from 'react';
import { Hero, HeroRole } from '../types';
import { getHeroAvatarUrl } from '../data/heroes';

interface HeroCardProps {
  hero: Hero;
  isSelected: boolean;
  onToggle: (id: string) => void;
  ossBaseUrl?: string;
  inModal?: boolean;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, isSelected, onToggle, ossBaseUrl = 'https://your-oss-bucket.oss-region.aliyuncs.com', inModal = false }) => {
  const handleClick = () => {
    // 在弹窗内不允许交互
    if (inModal) return;
    onToggle(hero.id);
  };
  // 使用 OSS 存储的英雄头像
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

  const { title, name } = parseHeroName(hero.cnName);

  return (
    <button
      onClick={handleClick}
      className={`
        relative group flex flex-col items-center overflow-hidden rounded-xl transition-all duration-200 border-2         ${isSelected && !inModal
          ? 'bg-zinc-900 border-zinc-800 opacity-60 scale-95 grayscale cursor-default shadow-inner'
          : isSelected && inModal
          ? 'bg-zinc-800 border-zinc-700 cursor-default shadow-md'
          : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer shadow-md'
        }
      `}
    >
      {/* Hero Image Container */}
      <div className="relative w-full aspect-[1/1] overflow-hidden">
        {/* Background Image */}
        <div className={`absolute inset-0 bg-cover bg-top transition-transform duration-500 ${inModal ? '' : 'group-hover:scale-110'}`}
             style={{
               backgroundImage: `url(${imageUrl})`,
               opacity: isSelected && !inModal ? 0.8 : 1
             }}
        />

        {/* Nickname banner at bottom of image (if exists) */}
        {hero.nickname && (
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

      {/* Text Content - Below Image */}
      <div className="w-full p-2 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="flex flex-col leading-tight">
            <h3 className={`text-[12px] md:text-lg font-bold truncate mb-1 ${isSelected && !inModal ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {title}
            </h3>
            {name && <div className={`text-[14px] md:text-xl font-normal truncate opacity-80 ${isSelected && !inModal ? 'text-zinc-600' : 'text-white'}`}>{name}</div>}
          </div>
          <span className={`text-[12px] md:text-sm tracking-wide font-semibold truncate ${isSelected && !inModal ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {hero.name.charAt(0).toUpperCase() + hero.name.slice(1).toLowerCase()}
          </span>
        </div>
      </div>
    </button>
  );
};

export default HeroCard;