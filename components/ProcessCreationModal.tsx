'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Settings } from 'lucide-react';

interface ProcessCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProcess: (name: string, burstTime: number, priority: number, arrivalTime: number) => void;
}

/**
 * 进程创建模态框组件
 */
export default function ProcessCreationModal({
  isOpen,
  onClose,
  onCreateProcess
}: ProcessCreationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    burstTime: 10,
    priority: 5,
    arrivalTime: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * 验证表单数据
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '进程名称不能为空';
    }

    if (formData.burstTime <= 0) {
      newErrors.burstTime = '执行时间必须大于0';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = '优先级必须在1-10之间';
    }

    if (formData.arrivalTime < 0) {
      newErrors.arrivalTime = '到达时间不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreateProcess(
        formData.name,
        formData.burstTime,
        formData.priority,
        formData.arrivalTime
      );
      
      // 重置表单
      setFormData({
        name: '',
        burstTime: 10,
        priority: 5,
        arrivalTime: 0
      });
      setErrors({});
      onClose();
    }
  };

  /**
   * 生成随机进程数据
   */
  const generateRandomProcess = () => {
    const names = ['计算任务', '文件处理', '网络请求', '数据分析', '图像渲染', '音频处理', '系统服务', '用户界面'];
    const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
    
    setFormData({
      name: randomName,
      burstTime: Math.floor(Math.random() * 20) + 5, // 5-24ms
      priority: Math.floor(Math.random() * 10) + 1,  // 1-10
      arrivalTime: Math.floor(Math.random() * 10)    // 0-9ms
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">创建新进程</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 表单内容 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 进程名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  进程名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="输入进程名称"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* 执行时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  执行时间 (ms)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.burstTime}
                  onChange={(e) => setFormData({ ...formData, burstTime: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.burstTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.burstTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.burstTime}</p>
                )}
              </div>

              {/* 优先级 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级 (1-10, 数字越小优先级越高)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.priority && (
                  <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
                )}
              </div>

              {/* 到达时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到达时间 (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.arrivalTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>
                )}
              </div>

              {/* 快速生成按钮 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={generateRandomProcess}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>生成随机进程</span>
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  创建进程
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
