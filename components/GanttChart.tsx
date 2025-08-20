'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GanttItem } from '@/types/process';
import { Clock, Cpu } from 'lucide-react';

interface GanttChartProps {
  ganttData: GanttItem[];
  currentTime: number;
  maxTime?: number;
  height?: number;
}

/**
 * 甘特图可视化组件
 */
export default function GanttChart({ 
  ganttData, 
  currentTime, 
  maxTime = 50,
  height = 300 
}: GanttChartProps) {
  // 计算时间轴刻度
  const timeScale = Math.max(maxTime, currentTime + 10);
  const timeMarks = Array.from({ length: Math.ceil(timeScale / 5) + 1 }, (_, i) => i * 5);
  
  // 获取所有唯一的进程
  const uniqueProcesses = Array.from(
    new Set(ganttData.map(item => item.processId))
  ).map(processId => {
    const firstItem = ganttData.find(item => item.processId === processId);
    return {
      id: processId,
      name: firstItem?.processName || `进程 ${processId}`,
      color: firstItem?.color || '#3B82F6'
    };
  });

  // 为每个进程分配一行
  const rowHeight = Math.max(40, (height - 80) / Math.max(uniqueProcesses.length, 1));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-gray-800">CPU调度甘特图</h3>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            当前时间: {currentTime}ms
          </span>
        </div>
      </div>

      {/* 甘特图主体 */}
      <div className="relative" style={{ height: `${height}px` }}>
        {/* 时间轴 */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gray-100 border-b border-gray-200">
          <div className="relative h-full">
            {timeMarks.map(time => (
              <div
                key={time}
                className="absolute top-0 bottom-0 border-l border-gray-300"
                style={{ left: `${(time / timeScale) * 100}%` }}
              >
                <span className="absolute top-1 left-1 text-xs text-gray-600 font-mono">
                  {time}
                </span>
              </div>
            ))}
            
            {/* 当前时间指示线 */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${(currentTime / timeScale) * 100}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-2 h-2 text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* 进程行 */}
        <div className="absolute top-12 left-0 right-0 bottom-0">
          {uniqueProcesses.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>暂无调度数据</p>
                <p className="text-sm">开始模拟后将显示甘特图</p>
              </div>
            </div>
          ) : (
            uniqueProcesses.map((process, index) => (
              <div
                key={process.id}
                className="relative border-b border-gray-100"
                style={{ height: `${rowHeight}px` }}
              >
                {/* 进程标签 */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gray-50 border-r border-gray-200 flex items-center px-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: process.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {process.name}
                    </span>
                  </div>
                </div>

                {/* 执行时间段 */}
                <div className="absolute left-32 top-0 bottom-0 right-0">
                  <AnimatePresence>
                    {ganttData
                      .filter(item => item.processId === process.id)
                      .map((item, itemIndex) => {
                        const startPercent = (item.startTime / timeScale) * 100;
                        const widthPercent = ((item.endTime - item.startTime) / timeScale) * 100;
                        
                        return (
                          <motion.div
                            key={`${item.processId}-${item.startTime}-${itemIndex}`}
                            className="absolute top-1 bottom-1 rounded shadow-sm border border-white cursor-pointer hover:shadow-md transition-shadow"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: item.color,
                              opacity: 0.8
                            }}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 0.8 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ opacity: 1, scale: 1.02 }}
                          >
                            {/* 时间段信息 */}
                            <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                              {widthPercent > 8 && (
                                <span>
                                  {item.startTime}-{item.endTime}
                                </span>
                              )}
                            </div>
                            
                            {/* 悬停提示 */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                              {item.processName}: {item.startTime}ms - {item.endTime}ms
                              <br />
                              执行时长: {item.endTime - item.startTime}ms
                            </div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 网格线 */}
        <div className="absolute top-12 left-32 right-0 bottom-0 pointer-events-none">
          {timeMarks.map(time => (
            <div
              key={time}
              className="absolute top-0 bottom-0 border-l border-gray-200 opacity-50"
              style={{ left: `${(time / timeScale) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* 底部统计信息 */}
      {ganttData.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              总执行时间: {Math.max(...ganttData.map(item => item.endTime))}ms
            </span>
            <span>
              进程切换次数: {ganttData.length}
            </span>
            <span>
              CPU利用率: {ganttData.length > 0 ? 
                ((ganttData.reduce((sum, item) => sum + (item.endTime - item.startTime), 0) / 
                  Math.max(...ganttData.map(item => item.endTime))) * 100).toFixed(1) : 0
              }%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
