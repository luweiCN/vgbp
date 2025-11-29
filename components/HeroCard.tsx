import React from 'react';
import { Hero, HeroRole } from '../types';
import { getHeroAvatarUrl } from '../data/heroes';

interface HeroCardProps {
  hero: Hero;
  isSelected: boolean;
  onToggle: (id: string) => void;
  ossBaseUrl?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, isSelected, onToggle, ossBaseUrl = 'https://your-oss-bucket.oss-region.aliyuncs.com' }) => {
  // 使用 OSS 存储的英雄头像
  const imageUrl = getHeroAvatarUrl(hero, ossBaseUrl);

  return (
    <button
      onClick={() => onToggle(hero.id)}
      className={`
        relative group flex flex-col items-center justify-end p-0 overflow-hidden rounded-xl transition-all duration-200 border-2
        ${isSelected 
          ? 'bg-zinc-900 border-zinc-800 opacity-50 scale-95 grayscale cursor-default shadow-inner' 
          : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer shadow-md'
        }
      `}
      style={{ aspectRatio: '1/1' }} 
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-top transition-transform duration-500 group-hover:scale-110" 
           style={{ 
             backgroundImage: `url(${imageUrl})`,
             opacity: isSelected ? 0.3 : 1
           }} 
      />
      
      {/* Overlay Gradient for text readability */}
      <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-black/90 to-black/60' : 'from-black/90 via-black/20 to-transparent'}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full pb-2">
        <h3 className={`text-sm md:text-base font-bold text-center leading-tight ${isSelected ? 'text-zinc-500 line-through' : 'text-white'}`}>
          {hero.cnName}
        </h3>
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isSelected ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {hero.name}
        </span>
        
        {isSelected && (
           <div className="mt-1 text-red-500 font-bold text-[10px] uppercase tracking-widest border border-red-900/50 bg-red-900/40 px-1.5 py-0.5 rounded">
             Picked
           </div>
        )}
      </div>

      {/* Selected Overlay Effect (Crossed out visual) */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[2px] bg-red-900/60 rotate-45 transform origin-center"></div>
            <div className="w-full h-[2px] bg-red-900/60 -rotate-45 transform origin-center"></div>
        </div>
      )}
    </button>
  );
};

export default HeroCard;