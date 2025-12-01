import React from 'react';

interface ClassificationInfoModalProps {
  onClose: () => void;
}

const ClassificationInfoModal: React.FC<ClassificationInfoModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">英雄分类说明</h3>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-zinc-300">
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <h4 className="font-semibold text-yellow-400">官方分类</h4>
            </div>
            <p className="text-sm leading-relaxed">
              指的是按照游戏内部的官方分类。
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h4 className="font-semibold text-emerald-400">常用分类</h4>
            </div>
            <p className="text-sm leading-relaxed">
              常见分类是我们最常使用这个英雄打的位置，比如官方分类中把牛头放在了对线英雄，但是我们最常见的是牛头去打辅助位置。
            </p>
          </div>

          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <h4 className="font-semibold text-red-400">灵活分类</h4>
            </div>
            <p className="text-sm leading-relaxed">
              灵活兼顾了我们通常使用这个英雄可以打的所有位置，比如盲豹 格雷这个英雄，在官方分类中他属于打野英雄，而常见分类中属于对线英雄，因为我们使用他最常打的位置应该是对线，或者说人们对他的第一印象。而实际上这个英雄可以走物理出装去对线，也可以走ap出装去打野，甚至还可以去辅助位置。灵活分类就是标明了某个英雄常见的所有可能位置。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationInfoModal;