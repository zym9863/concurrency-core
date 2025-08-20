'use client';

import { useState, useEffect, useRef } from 'react';
import { useSimulatorStore } from '@/store/simulator';
import { ProcessState, SchedulingAlgorithm } from '@/types/process';
import { SchedulerFactory, SchedulingEngine } from '@/lib/schedulers';
import ProcessQueue from '@/components/ProcessQueue';
import GanttChart from '@/components/GanttChart';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import ProcessCreationModal from '@/components/ProcessCreationModal';
import QuickStartGuide from '@/components/QuickStartGuide';
import { Play, Pause, Square, RotateCcw, Plus, Settings, Cpu } from 'lucide-react';

/**
 * 并发核心可视化模拟器主页面
 */
export default function Home() {
  const {
    processes,
    readyQueue,
    runningProcess,
    blockedQueue,
    terminatedQueue,
    ganttChart,
    metrics,
    config,
    isRunning,
    isPaused,
    currentTime,
    timeScale,
    createProcess,
    updateProcessState,
    deleteProcess,
    setSchedulingConfig,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    setTimeScale,
    addGanttItem,
    clearGanttChart,
    updateMetrics
  } = useSimulatorStore();

  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [schedulingEngine] = useState(new SchedulingEngine());
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * 获取不同状态的进程列表
   */
  const getProcessesByState = (state: ProcessState) => {
    return processes.filter(p => p.state === state);
  };

  const readyProcesses = processes.filter(p => readyQueue.includes(p.id));
  const runningProcesses = runningProcess ? processes.filter(p => p.id === runningProcess) : [];
  const blockedProcesses = processes.filter(p => blockedQueue.includes(p.id));
  const terminatedProcesses = processes.filter(p => terminatedQueue.includes(p.id));

  /**
   * 创建示例进程
   */
  const createSampleProcesses = () => {
    const sampleProcesses = [
      { name: '系统初始化', burstTime: 8, priority: 1, arrivalTime: 0 },
      { name: '用户登录', burstTime: 5, priority: 3, arrivalTime: 2 },
      { name: '文件扫描', burstTime: 12, priority: 5, arrivalTime: 3 },
      { name: '网络同步', burstTime: 6, priority: 2, arrivalTime: 5 },
      { name: '数据备份', burstTime: 15, priority: 7, arrivalTime: 8 }
    ];

    sampleProcesses.forEach(process => {
      createProcess(process.name, process.burstTime, process.priority, process.arrivalTime);
    });

    // 自动开始模拟
    setTimeout(() => {
      startSimulation();
    }, 500);
  };

  /**
   * 执行一个时间步的模拟
   */
  const executeSimulationStep = () => {
    if (processes.length === 0) return;

    // 检查是否有新进程到达
    processes.forEach(process => {
      if (process.state === ProcessState.NEW && process.arrivalTime <= currentTime) {
        updateProcessState(process.id, ProcessState.READY);
      }
    });

    // 执行调度算法
    const result = schedulingEngine.executeTimeSlice(
      processes,
      readyQueue,
      runningProcess,
      config,
      currentTime
    );

    // 更新运行进程
    if (result.newRunningProcess !== runningProcess) {
      if (runningProcess) {
        const currentProcess = processes.find(p => p.id === runningProcess);
        if (currentProcess && currentProcess.state === ProcessState.RUNNING) {
          updateProcessState(runningProcess, ProcessState.READY);
        }
      }

      if (result.newRunningProcess) {
        updateProcessState(result.newRunningProcess, ProcessState.RUNNING);

        // 添加甘特图项
        const process = processes.find(p => p.id === result.newRunningProcess);
        if (process) {
          addGanttItem({
            processId: process.id,
            processName: process.name,
            startTime: currentTime,
            endTime: currentTime + 1,
            color: process.color
          });
        }
      }
    }

    // 更新当前运行进程的剩余时间
    if (runningProcess) {
      const process = processes.find(p => p.id === runningProcess);
      if (process && process.remainingTime > 0) {
        process.remainingTime -= 1;
        process.waitingTime = currentTime - process.arrivalTime - (process.burstTime - process.remainingTime);

        if (process.remainingTime <= 0) {
          process.completionTime = currentTime + 1;
          process.turnaroundTime = process.completionTime - process.arrivalTime;
          updateProcessState(process.id, ProcessState.TERMINATED);
        }
      }
    }

    // 更新等待时间
    readyProcesses.forEach(process => {
      process.waitingTime = Math.max(0, currentTime - process.arrivalTime - (process.burstTime - process.remainingTime));
    });

    stepSimulation();
    updateMetrics();
  };

  /**
   * 开始/暂停模拟
   */
  const toggleSimulation = () => {
    if (isRunning && !isPaused) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  };

  /**
   * 停止模拟
   */
  const handleStopSimulation = () => {
    stopSimulation();
    schedulingEngine.reset();
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  };

  /**
   * 重置模拟
   */
  const handleResetSimulation = () => {
    resetSimulation();
    schedulingEngine.reset();
    clearGanttChart();
    setSelectedProcessId(null);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  };

  /**
   * 模拟循环
   */
  useEffect(() => {
    if (isRunning && !isPaused) {
      simulationInterval.current = setInterval(() => {
        executeSimulationStep();
      }, 1000 / timeScale);
    } else {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
        simulationInterval.current = null;
      }
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [isRunning, isPaused, timeScale, currentTime, processes, readyQueue, runningProcess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 animate-fade-in">
      {/* 头部导航 */}
      <header className="relative bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-soft border-b border-white/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Cpu className="w-10 h-10 text-blue-600 animate-pulse-slow" />
                <div className="absolute inset-0 w-10 h-10 bg-blue-600/20 rounded-full blur-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  并发核心可视化模拟器
                </h1>
                <p className="text-sm text-slate-600 mt-1">实时进程调度算法可视化平台</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* 调度算法选择器 */}
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
                <Settings className="w-5 h-5 text-blue-600" />
                <select
                  value={config.algorithm}
                  onChange={(e) => setSchedulingConfig({
                    ...config,
                    algorithm: e.target.value as SchedulingAlgorithm
                  })}
                  className="bg-transparent border-0 text-sm font-medium text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
                  disabled={isRunning}
                >
                  {SchedulerFactory.getAvailableAlgorithms().map(algo => (
                    <option key={algo.value} value={algo.value}>
                      {algo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 时间片设置（仅轮转调度） */}
              {config.algorithm === SchedulingAlgorithm.ROUND_ROBIN && (
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
                  <span className="text-sm font-medium text-slate-700">时间片:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.timeQuantum || 2}
                    onChange={(e) => setSchedulingConfig({
                      ...config,
                      timeQuantum: parseInt(e.target.value, 10) || 2
                    })}
                    className="w-16 px-2 py-1 bg-white/80 border border-white/40 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                    disabled={isRunning}
                  />
                  <span className="text-sm font-medium text-slate-700">ms</span>
                </div>
              )}

              {/* 控制按钮 */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-soft hover:shadow-glow hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                  disabled={isRunning}
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-medium">创建进程</span>
                </button>

                <button
                  onClick={toggleSimulation}
                  className={`group flex items-center space-x-2 px-5 py-2.5 rounded-xl shadow-soft transition-all duration-300 transform hover:scale-105 font-medium ${
                    isRunning && !isPaused
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-glow hover:from-amber-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-glow-green hover:from-emerald-600 hover:to-green-700'
                  }`}
                  disabled={processes.length === 0}
                >
                  {isRunning && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>暂停</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>开始</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStopSimulation}
                  className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-soft hover:shadow-glow hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 font-medium"
                  disabled={!isRunning}
                >
                  <Square className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                  <span>停止</span>
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl shadow-soft hover:shadow-glow hover:from-slate-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>重置</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 状态信息栏 */}
        <div className="mb-8 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft animate-slide-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-soft">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">当前时间</span>
                  <div className="font-mono font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentTime}ms
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-3 h-3 rounded-full ${
                  isRunning
                    ? isPaused
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-400'
                }`}></div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">模拟状态</span>
                  <div className={`font-semibold ${
                    isRunning
                      ? isPaused
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                      : 'text-slate-600'
                  }`}>
                    {isRunning ? (isPaused ? '已暂停' : '运行中') : '已停止'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-soft">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">调度算法</span>
                  <div className="font-semibold text-purple-600">
                    {SchedulerFactory.getScheduler(config.algorithm).getName()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-soft">
                  <span className="text-white font-bold text-lg">{processes.length}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">进程总数</span>
                  <div className="font-semibold text-emerald-600">
                    {processes.length} 个进程
                  </div>
                </div>
              </div>
            </div>

            {/* 时间缩放控制 */}
            <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 shadow-soft">
              <span className="text-sm font-medium text-slate-600">速度:</span>
              <div className="relative">
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={timeScale}
                  onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
                  }
                `}</style>
              </div>
              <span className="text-sm font-mono font-bold text-slate-700 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1 rounded-lg">
                {timeScale}x
              </span>
            </div>
          </div>
        </div>

        {/* 进程队列可视化区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <ProcessQueue
            title="就绪队列"
            processes={readyProcesses}
            state={ProcessState.READY}
            onProcessClick={(process) => setSelectedProcessId(process.id)}
            onProcessStateChange={updateProcessState}
            onProcessDelete={deleteProcess}
            onAddProcess={() => setIsCreateModalOpen(true)}
            selectedProcessId={selectedProcessId ?? undefined}
            maxHeight="400px"
          />

          <ProcessQueue
            title="运行中"
            processes={runningProcesses}
            state={ProcessState.RUNNING}
            onProcessClick={(process) => setSelectedProcessId(process.id)}
            onProcessStateChange={updateProcessState}
            onProcessDelete={deleteProcess}
            selectedProcessId={selectedProcessId ?? undefined}
            maxHeight="400px"
          />

          <ProcessQueue
            title="阻塞队列"
            processes={blockedProcesses}
            state={ProcessState.BLOCKED}
            onProcessClick={(process) => setSelectedProcessId(process.id)}
            onProcessStateChange={updateProcessState}
            onProcessDelete={deleteProcess}
            selectedProcessId={selectedProcessId ?? undefined}
            maxHeight="400px"
          />

          <ProcessQueue
            title="已终止"
            processes={terminatedProcesses}
            state={ProcessState.TERMINATED}
            onProcessClick={(process) => setSelectedProcessId(process.id)}
            onProcessDelete={deleteProcess}
            selectedProcessId={selectedProcessId ?? undefined}
            maxHeight="400px"
          />
        </div>

        {/* 甘特图区域 */}
        <div className="mb-8">
          <GanttChart
            ganttData={ganttChart}
            currentTime={currentTime}
            maxTime={Math.max(50, currentTime + 20)}
            height={300}
          />
        </div>

        {/* 性能指标区域 */}
        <div className="mb-8">
          <PerformanceMetrics
            metrics={metrics}
            algorithmName={SchedulerFactory.getScheduler(config.algorithm).getName()}
          />
        </div>
      </main>

      {/* 进程创建模态框 */}
      <ProcessCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProcess={(name, burstTime, priority, arrivalTime) => {
          createProcess(name, burstTime, priority, arrivalTime);
        }}
      />

      {/* 快速开始指南 */}
      {processes.length === 0 && (
        <QuickStartGuide onCreateSampleProcesses={createSampleProcesses} />
      )}
    </div>
  );
}
