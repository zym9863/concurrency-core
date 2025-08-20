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
        color: 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200/60 text-slate-700',
        icon: <AlertCircle className="w-4 h-4" />,
        label: '新建',
        badgeColor: 'bg-gradient-to-r from-slate-400 to-gray-500'
      };
    case ProcessState.READY:
      return { 
        color: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/60 text-blue-700',
        icon: <Clock className="w-4 h-4" />,
        label: '就绪',
        badgeColor: 'bg-gradient-to-r from-blue-400 to-indigo-500'
      };
    case ProcessState.RUNNING:
      return { 
        color: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/60 text-emerald-700',
        icon: <Cpu className="w-4 h-4" />,
        label: '运行',
        badgeColor: 'bg-gradient-to-r from-emerald-400 to-green-500'
      };
    case ProcessState.BLOCKED:
      return { 
        color: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200/60 text-amber-700',
        icon: <Pause className="w-4 h-4" />,
        label: '阻塞',
        badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500'
      };
    case ProcessState.TERMINATED:
      return { 
        color: 'bg-gradient-to-br from-rose-50 to-red-100 border-rose-200/60 text-rose-700',
        icon: <CheckCircle className="w-4 h-4" />,
        label: '终止',
        badgeColor: 'bg-gradient-to-r from-rose-400 to-red-500'
      };
    default:
      return { 
        color: 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200/60 text-slate-700',
        icon: <AlertCircle className="w-4 h-4" />,
        label: '未知',
        badgeColor: 'bg-gradient-to-r from-slate-400 to-gray-500'
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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-5 rounded-2xl border border-white/40 cursor-pointer transition-all duration-300
        ${stateInfo.color}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent shadow-glow' : 'shadow-soft'}
        hover:shadow-glow backdrop-blur-sm
      `}
      style={{ 
        borderLeft: `6px solid ${process.color}`,
        background: `linear-gradient(135deg, ${stateInfo.color.includes('blue') ? 'rgba(59, 130, 246, 0.05)' : 
                     stateInfo.color.includes('emerald') ? 'rgba(16, 185, 129, 0.05)' :
                     stateInfo.color.includes('amber') ? 'rgba(245, 158, 11, 0.05)' :
                     stateInfo.color.includes('rose') ? 'rgba(244, 63, 94, 0.05)' : 'rgba(148, 163, 184, 0.05)'} 0%, rgba(255, 255, 255, 0.9) 100%)`
      }}
      onClick={onClick}
    >
      {/* 进程头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${stateInfo.badgeColor} rounded-xl shadow-soft`}>
            {stateInfo.icon}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800">
              {process.name}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              PID: {process.pid}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-xl text-xs font-bold text-white ${stateInfo.badgeColor} shadow-soft`}>
          {stateInfo.label}
        </div>
      </div>

      {/* 进程详细信息 */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">优先级:</span>
            <span className="font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {process.priority}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">执行时间:</span>
            <span className="font-mono font-bold text-slate-700">{process.burstTime}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">剩余时间:</span>
            <span className="font-mono font-bold text-orange-600">{process.remainingTime}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">等待时间:</span>
            <span className="font-mono font-bold text-amber-600">{process.waitingTime}ms</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-medium text-slate-600">执行进度</span>
          <span className="font-bold text-slate-700 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1 rounded-lg">
            {Math.round(((process.burstTime - process.remainingTime) / process.burstTime) * 100)}%
          </span>
        </div>
        <div className="relative w-full bg-gradient-to-r from-slate-200 to-gray-300 rounded-full h-3 shadow-inner">
          <motion.div
            className="h-3 rounded-full shadow-soft relative overflow-hidden"
            style={{ 
              background: `linear-gradient(90deg, ${process.color} 0%, ${process.color}dd 50%, ${process.color}aa 100%)`
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((process.burstTime - process.remainingTime) / process.burstTime) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
          </motion.div>
        </div>
      </div>

      {/* 子线程数量指示器 */}
      {process.threads.length > 0 && (
        <div className="mb-3 flex items-center space-x-2 bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <Play className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-slate-700">
            {process.threads.length} 个线程
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {process.state === ProcessState.RUNNING && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStateChange?.(ProcessState.BLOCKED);
              }}
              className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-lg shadow-soft hover:shadow-glow hover:from-amber-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
            >
              <Pause className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
              阻塞
            </button>
          )}
          
          {process.state === ProcessState.BLOCKED && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStateChange?.(ProcessState.READY);
              }}
              className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-lg shadow-soft hover:shadow-glow hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
              唤醒
            </button>
          )}
          
          {process.state !== ProcessState.TERMINATED && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStateChange?.(ProcessState.TERMINATED);
              }}
              className="group flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-lg shadow-soft hover:shadow-glow hover:from-red-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
            >
              <CheckCircle className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
              终止
            </button>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="group flex items-center justify-center w-8 h-8 bg-gradient-to-r from-slate-400 to-gray-500 text-white rounded-lg shadow-soft hover:shadow-glow hover:from-slate-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105"
          title="删除进程"
        >
          <span className="text-xs font-bold group-hover:rotate-45 transition-transform duration-300">×</span>
        </button>
      </div>
    </motion.div>
  );
}
