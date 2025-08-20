'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Play, Settings, BarChart3, Cpu } from 'lucide-react';

interface QuickStartGuideProps {
  onCreateSampleProcesses: () => void;
}

/**
 * 快速开始指南组件
 */
export default function QuickStartGuide({ onCreateSampleProcesses }: QuickStartGuideProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <BookOpen className="w-5 h-5" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">快速开始指南</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">
            欢迎使用并发核心可视化模拟器！按照以下步骤开始体验：
          </div>

          {/* 步骤列表 */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-1">创建进程</div>
                <div className="text-xs text-gray-600">
                  点击"创建进程"按钮添加新进程，或使用下面的快速创建按钮
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-1">选择调度算法</div>
                <div className="text-xs text-gray-600">
                  在顶部选择不同的CPU调度算法（FCFS、SJF、优先级、轮转）
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-1">开始模拟</div>
                <div className="text-xs text-gray-600">
                  点击"开始"按钮启动模拟，观察进程在不同状态间的转换
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-1">观察结果</div>
                <div className="text-xs text-gray-600">
                  查看甘特图和性能指标，比较不同算法的效果
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作按钮 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-800 mb-3">快速操作</div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onCreateSampleProcesses();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                <span>创建示例进程并开始</span>
              </button>
            </div>
          </div>

          {/* 功能介绍 */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-800 mb-3">主要功能</div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Cpu className="w-3 h-3 text-blue-500" />
                <span>实时进程状态可视化</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-3 h-3 text-blue-500" />
                <span>多种CPU调度算法</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-3 h-3 text-blue-500" />
                <span>性能指标分析对比</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
