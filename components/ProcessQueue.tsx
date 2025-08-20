'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Process, ProcessState } from '@/types/process';
import ProcessCard from './ProcessCard';
import { Clock, Cpu, Pause, CheckCircle, Plus } from 'lucide-react';

interface ProcessQueueProps {
  title: string;
  processes: Process[];
  state: ProcessState;
  onProcessClick?: (process: Process) => void;
  onProcessStateChange?: (processId: string, newState: ProcessState) => void;
  onProcessDelete?: (processId: string) => void;
  onAddProcess?: () => void;
  selectedProcessId?: string;
  maxHeight?: string;
}

/**
 * 获取队列状态对应的图标和颜色
 */
const getQueueInfo = (state: ProcessState) => {
  switch (state) {
    case ProcessState.READY:
      return {
        icon: <Clock className="w-5 h-5" />,
        color: 'border-blue-300 bg-blue-50',
        headerColor: 'bg-blue-100 text-blue-800'
      };
    case ProcessState.RUNNING:
      return {
        icon: <Cpu className="w-5 h-5" />,
        color: 'border-green-300 bg-green-50',
        headerColor: 'bg-green-100 text-green-800'
      };
    case ProcessState.BLOCKED:
      return {
        icon: <Pause className="w-5 h-5" />,
        color: 'border-yellow-300 bg-yellow-50',
        headerColor: 'bg-yellow-100 text-yellow-800'
      };
    case ProcessState.TERMINATED:
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'border-red-300 bg-red-50',
        headerColor: 'bg-red-100 text-red-800'
      };
    default:
      return {
        icon: <Clock className="w-5 h-5" />,
        color: 'border-gray-300 bg-gray-50',
        headerColor: 'bg-gray-100 text-gray-800'
      };
  }
};

/**
 * 进程队列组件
 */
export default function ProcessQueue({
  title,
  processes,
  state,
  onProcessClick,
  onProcessStateChange,
  onProcessDelete,
  onAddProcess,
  selectedProcessId,
  maxHeight = '400px'
}: ProcessQueueProps) {
  const queueInfo = getQueueInfo(state);
  
  return (
    <div className={`border-2 rounded-lg ${queueInfo.color} overflow-hidden`}>
      {/* 队列头部 */}
      <div className={`px-4 py-3 ${queueInfo.headerColor} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {queueInfo.icon}
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded-full">
            {processes.length} 个进程
          </span>
        </div>
        
        {/* 添加进程按钮 */}
        {onAddProcess && (
          <button
            onClick={onAddProcess}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-white bg-opacity-50 hover:bg-opacity-75 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加进程</span>
          </button>
        )}
      </div>

      {/* 队列内容区域 */}
      <div 
        className="p-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {processes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500"
            >
              <div className="text-4xl mb-2">📭</div>
              <p>队列为空</p>
              {onAddProcess && (
                <button
                  onClick={onAddProcess}
                  className="mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  创建第一个进程
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {processes.map((process, index) => (
                <motion.div
                  key={process.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative"
                >
                  {/* 队列位置指示器 */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                  
                  <ProcessCard
                    process={process}
                    onClick={() => onProcessClick?.(process)}
                    onStateChange={(newState) => onProcessStateChange?.(process.id, newState)}
                    onDelete={() => onProcessDelete?.(process.id)}
                    isSelected={selectedProcessId === process.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 队列统计信息 */}
      {processes.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-white bg-opacity-50">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              平均优先级: {(processes.reduce((sum, p) => sum + p.priority, 0) / processes.length).toFixed(1)}
            </span>
            <span>
              总执行时间: {processes.reduce((sum, p) => sum + p.burstTime, 0)}ms
            </span>
            <span>
              平均等待时间: {(processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length).toFixed(1)}ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
