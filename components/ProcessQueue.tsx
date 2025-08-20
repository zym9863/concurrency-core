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
        color: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/60',
        headerColor: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
        shadowColor: 'shadow-glow'
      };
    case ProcessState.RUNNING:
      return {
        icon: <Cpu className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/60',
        headerColor: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
        shadowColor: 'shadow-glow-green'
      };
    case ProcessState.BLOCKED:
      return {
        icon: <Pause className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200/60',
        headerColor: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
        shadowColor: 'shadow-soft'
      };
    case ProcessState.TERMINATED:
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-rose-50 to-red-100 border-rose-200/60',
        headerColor: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
        shadowColor: 'shadow-soft'
      };
    default:
      return {
        icon: <Clock className="w-5 h-5" />,
        color: 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200/60',
        headerColor: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white',
        shadowColor: 'shadow-soft'
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
    <div className={`border border-white/40 rounded-2xl ${queueInfo.color} ${queueInfo.shadowColor} overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
      {/* 队列头部 */}
      <div className={`px-5 py-4 ${queueInfo.headerColor} flex items-center justify-between shadow-soft`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            {queueInfo.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-3 py-1 text-xs font-medium bg-white/30 backdrop-blur-sm rounded-full">
                {processes.length} 个进程
              </span>
            </div>
          </div>
        </div>
        
        {/* 添加进程按钮 */}
        {onAddProcess && (
          <button
            onClick={onAddProcess}
            className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>添加进程</span>
          </button>
        )}
      </div>

      {/* 队列内容区域 */}
      <div 
        className="p-6 overflow-y-auto backdrop-blur-sm"
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {processes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="relative mb-4">
                <div className="text-6xl opacity-70 animate-pulse-slow">📭</div>
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
              </div>
              <p className="text-slate-600 font-medium mb-4">队列为空</p>
              {onAddProcess && (
                <button
                  onClick={onAddProcess}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-soft hover:shadow-glow hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>创建第一个进程</span>
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
