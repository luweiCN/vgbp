import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';

const SupabaseConfigGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  const { showSuccess } = useToast();

  const steps = [
    {
      id: 1,
      title: '登录 Supabase Dashboard',
      description: '访问 https://supabase.com/dashboard 并登录',
      action: '访问网站',
      url: 'https://supabase.com/dashboard'
    },
    {
      id: 2,
      title: '选择你的项目',
      description: '在项目列表中点击选择你的项目（hvbqzfdmmoupwvbwegug）',
      action: '选择项目'
    },
    {
      id: 3,
      title: '进入数据库设置',
      description: '在左侧导航栏点击 "Database"',
      action: '点击 Database'
    },
    {
      id: 4,
      title: '找到复制设置',
      description: '滚动到页面下方或直接点击 "Replication" 选项卡',
      action: '打开 Replication'
    },
    {
      id: 5,
      title: '启用 bp_states 表复制',
      description: '找到 bp_states 表，点击右侧的 "Reset" 按钮启用复制',
      action: '重置 bp_states'
    },
    {
      id: 6,
      title: '启用其他表复制（可选）',
      description: '同时启用 rooms 和 room_participants 表的复制功能',
      action: '重置其他表'
    }
  ];

  const handleStepComplete = (stepId: number) => {
    if (stepId === steps.length) {
      setShowComplete(true);
      showSuccess('配置完成！现在可以测试实时同步功能了');
    } else {
      setCurrentStep(stepId + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">配置完成！</h3>
            <p className="text-zinc-300 mb-6">
              Realtime 复制功能已启用。现在可以测试实时同步功能了：
            </p>
            <ul className="text-left text-zinc-400 text-sm space-y-2 mb-6">
              <li>✅ 创建一个房间</li>
              <li>✅ 在另一个浏览器标签页中加入房间</li>
              <li>✅ 测试英雄选择的实时同步</li>
            </ul>
            <button
              onClick={() => {
                setShowComplete(false);
                setCurrentStep(1);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              关闭指南
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Supabase 配置指南</h3>
        <button
          onClick={() => setCurrentStep(1)}
          className="text-zinc-400 hover:text-white text-xs"
        >
          重置
        </button>
      </div>

      {/* 步骤指示器 */}
      <div className="flex gap-1 mb-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step.id <= currentStep ? 'bg-blue-600' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* 当前步骤内容 */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {currentStep}
            </span>
            <h4 className="text-sm font-medium text-white">
              {steps[currentStep - 1].title}
            </h4>
          </div>
          <p className="text-xs text-zinc-400 mb-2">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {steps[currentStep - 1].url && (
            <a
              href={steps[currentStep - 1].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors text-center"
            >
              {steps[currentStep - 1].action}
            </a>
          )}
          <button
            onClick={() => handleStepComplete(currentStep)}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            完成
          </button>
          {currentStep > 1 && (
            <button
              onClick={handleStepBack}
              className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
            >
              上一步
            </button>
          )}
        </div>

        {/* 快速提示 */}
        <div className="bg-zinc-800 rounded p-2 text-xs text-zinc-300">
          <strong>💡 提示：</strong>
          最重要的是第5步 - 启用 bp_states 表的复制功能！
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfigGuide;