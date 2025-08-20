'use client';

import { motion } from 'framer-motion';
import { Process, Thread, ProcessState } from '@/types/process';
import { Clock, Cpu, AlertCircle, CheckCircle, Pause, Play } from 'lucide-react';

interface ProcessCardProps {
  process: Process;
  onClick?: () => void;
  onStateChange?: (newState: ProcessState) => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

/**
 * 获取状态对应的颜色和图标
 */
const getStateInfo = (state: ProcessState) => {
  switch (state) {
    case ProcessState.NEW:
      return { 
        color: 'bg-gray-100 border-gray-300 text-gray-700',
        icon: <AlertCircle className="w-4 h-4" />,
        label: '新建'
      };
    case ProcessState.READY:
      return { 
        color: 'bg-blue-100 border-blue-300 text-blue-700',
        icon: <Clock className="w-4 h-4" />,
        label: '就绪'
      };
    case ProcessState.RUNNING:
      return { 
        color: 'bg-green-100 border-green-300 text-green-700',
        icon: <Cpu className="w-4 h-4" />,
        label: '运行'
      };
    case ProcessState.BLOCKED:
      return { 
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
        icon: <Pause className="w-4 h-4" />,
        label: '阻塞'
      };
    case ProcessState.TERMINATED:
      return { 
        color: 'bg-red-100 border-red-300 text-red-700',
        icon: <CheckCircle className="w-4 h-4" />,
        label: '终止'
      };
    default:
      return { 
        color: 'bg-gray-100 border-gray-300 text-gray-700',
        icon: <AlertCircle className="w-4 h-4" />,
        label: '未知'
      };
  }
};

/**
 * 进程卡片组件
 */
export default function ProcessCard({ 
  process, 
  onClick, 
  onStateChange, 
  onDelete, 
  isSelected = false 
}: ProcessCardProps) {
  const stateInfo = getStateInfo(process.state);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${stateInfo.color}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        hover:shadow-md
      `}
      style={{ borderLeftColor: process.color, borderLeftWidth: '4px' }}
      onClick={onClick}
    >
      {/* 进程头部信息 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {stateInfo.icon}
          <span className="font-semibold text-sm">
            {process.name} (PID: {process.pid})
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
          {stateInfo.label}
        </span>
      </div>

      {/* 进程详细信息 */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>优先级:</span>
          <span className="font-mono">{process.priority}</span>
        </div>
        <div className="flex justify-between">
          <span>执行时间:</span>
          <span className="font-mono">{process.burstTime}ms</span>
        </div>
        <div className="flex justify-between">
          <span>剩余时间:</span>
          <span className="font-mono">{process.remainingTime}ms</span>
        </div>
        <div className="flex justify-between">
          <span>等待时间:</span>
          <span className="font-mono">{process.waitingTime}ms</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>执行进度</span>
          <span>{Math.round(((process.burstTime - process.remainingTime) / process.burstTime) * 100)}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: process.color }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((process.burstTime - process.remainingTime) / process.burstTime) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 子线程数量指示器 */}
      {process.threads.length > 0 && (
        <div className="mt-2 flex items-center space-x-1">
          <Play className="w-3 h-3" />
          <span className="text-xs">
            {process.threads.length} 个线程
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-3 flex space-x-1">
        {process.state === ProcessState.RUNNING && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStateChange?.(ProcessState.BLOCKED);
            }}
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            阻塞
          </button>
        )}
        
        {process.state === ProcessState.BLOCKED && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStateChange?.(ProcessState.READY);
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            唤醒
          </button>
        )}
        
        {process.state !== ProcessState.TERMINATED && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStateChange?.(ProcessState.TERMINATED);
            }}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            终止
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          删除
        </button>
      </div>
    </motion.div>
  );
}
