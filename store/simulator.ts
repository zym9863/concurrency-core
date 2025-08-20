import { create } from 'zustand';
import { 
  Process, 
  Thread, 
  ProcessState, 
  SchedulingAlgorithm, 
  SimulatorState, 
  PerformanceMetrics,
  GanttItem,
  SchedulingConfig 
} from '@/types/process';

/**
 * 生成随机颜色
 */
const generateRandomColor = (): string => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 计算性能指标
 */
const calculateMetrics = (processes: Process[]): PerformanceMetrics => {
  const completedProcesses = processes.filter(p => p.state === ProcessState.TERMINATED);
  
  if (completedProcesses.length === 0) {
    return {
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0
    };
  }

  const totalWaitingTime = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
  const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
  const totalResponseTime = completedProcesses.reduce((sum, p) => sum + (p.startTime || 0) - p.arrivalTime, 0);
  
  const maxCompletionTime = Math.max(...completedProcesses.map(p => p.completionTime || 0));
  const totalBurstTime = completedProcesses.reduce((sum, p) => sum + p.burstTime, 0);
  
  return {
    averageWaitingTime: totalWaitingTime / completedProcesses.length,
    averageTurnaroundTime: totalTurnaroundTime / completedProcesses.length,
    averageResponseTime: totalResponseTime / completedProcesses.length,
    cpuUtilization: maxCompletionTime > 0 ? (totalBurstTime / maxCompletionTime) * 100 : 0,
    throughput: maxCompletionTime > 0 ? completedProcesses.length / maxCompletionTime : 0
  };
};

interface SimulatorStore extends SimulatorState {
  // 动作方法
  createProcess: (name: string, burstTime: number, priority?: number, arrivalTime?: number) => void;
  createThread: (parentPid: number, name: string, burstTime: number, priority?: number) => void;
  updateProcessState: (processId: string, newState: ProcessState) => void;
  deleteProcess: (processId: string) => void;
  deleteThread: (threadId: string) => void;
  setSchedulingConfig: (config: SchedulingConfig) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  setTimeScale: (scale: number) => void;
  addGanttItem: (item: GanttItem) => void;
  clearGanttChart: () => void;
  updateMetrics: () => void;
}

/**
 * 模拟器状态管理store
 */
export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  // 初始状态
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  timeScale: 1,
  processes: [],
  readyQueue: [],
  runningProcess: null,
  blockedQueue: [],
  terminatedQueue: [],
  ganttChart: [],
  metrics: {
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    averageResponseTime: 0,
    cpuUtilization: 0,
    throughput: 0
  },
  config: {
    algorithm: SchedulingAlgorithm.FCFS,
    timeQuantum: 2,
    preemptive: false
  },

  // 创建新进程
  createProcess: (name: string, burstTime: number, priority = 5, arrivalTime?: number) => {
    const state = get();
    const newProcess: Process = {
      id: generateId(),
      pid: state.processes.length + 1,
      name,
      state: ProcessState.NEW,
      priority,
      arrivalTime: arrivalTime ?? state.currentTime,
      burstTime,
      remainingTime: burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      createdAt: Date.now(),
      lastStateChange: Date.now(),
      threads: [],
      color: generateRandomColor()
    };

    set(state => ({
      processes: [...state.processes, newProcess]
    }));
  },

  // 创建新线程
  createThread: (parentPid: number, name: string, burstTime: number, priority = 5) => {
    const state = get();
    const parentProcess = state.processes.find(p => p.pid === parentPid);
    
    if (!parentProcess) return;

    const newThread: Thread = {
      id: generateId(),
      tid: parentProcess.threads.length + 1,
      parentPid,
      name,
      state: ProcessState.NEW,
      priority,
      arrivalTime: state.currentTime,
      burstTime,
      remainingTime: burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      createdAt: Date.now(),
      lastStateChange: Date.now(),
      color: generateRandomColor()
    };

    set(state => ({
      processes: state.processes.map(p => 
        p.pid === parentPid 
          ? { ...p, threads: [...p.threads, newThread] }
          : p
      )
    }));
  },

  // 更新进程状态
  updateProcessState: (processId: string, newState: ProcessState) => {
    set(state => {
      const updatedProcesses = state.processes.map(process => {
        if (process.id === processId) {
          return {
            ...process,
            state: newState,
            lastStateChange: Date.now()
          };
        }
        return process;
      });

      // 更新队列
      let newReadyQueue = [...state.readyQueue];
      let newBlockedQueue = [...state.blockedQueue];
      let newTerminatedQueue = [...state.terminatedQueue];
      let newRunningProcess = state.runningProcess;

      // 从所有队列中移除该进程
      newReadyQueue = newReadyQueue.filter(id => id !== processId);
      newBlockedQueue = newBlockedQueue.filter(id => id !== processId);
      newTerminatedQueue = newTerminatedQueue.filter(id => id !== processId);

      // 根据新状态添加到相应队列
      switch (newState) {
        case ProcessState.READY:
          newReadyQueue.push(processId);
          break;
        case ProcessState.RUNNING:
          newRunningProcess = processId;
          break;
        case ProcessState.BLOCKED:
          newBlockedQueue.push(processId);
          if (newRunningProcess === processId) {
            newRunningProcess = null;
          }
          break;
        case ProcessState.TERMINATED:
          newTerminatedQueue.push(processId);
          if (newRunningProcess === processId) {
            newRunningProcess = null;
          }
          break;
      }

      return {
        processes: updatedProcesses,
        readyQueue: newReadyQueue,
        blockedQueue: newBlockedQueue,
        terminatedQueue: newTerminatedQueue,
        runningProcess: newRunningProcess
      };
    });
  },

  // 删除进程
  deleteProcess: (processId: string) => {
    set(state => ({
      processes: state.processes.filter(p => p.id !== processId),
      readyQueue: state.readyQueue.filter(id => id !== processId),
      blockedQueue: state.blockedQueue.filter(id => id !== processId),
      terminatedQueue: state.terminatedQueue.filter(id => id !== processId),
      runningProcess: state.runningProcess === processId ? null : state.runningProcess
    }));
  },

  // 删除线程
  deleteThread: (threadId: string) => {
    set(state => ({
      processes: state.processes.map(p => ({
        ...p,
        threads: p.threads.filter(t => t.id !== threadId)
      }))
    }));
  },

  // 设置调度配置
  setSchedulingConfig: (config: SchedulingConfig) => {
    set({ config });
  },

  // 开始模拟
  startSimulation: () => {
    set({ isRunning: true, isPaused: false });
  },

  // 暂停模拟
  pauseSimulation: () => {
    set({ isPaused: true });
  },

  // 停止模拟
  stopSimulation: () => {
    set({ isRunning: false, isPaused: false });
  },

  // 重置模拟
  resetSimulation: () => {
    set({
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      processes: [],
      readyQueue: [],
      runningProcess: null,
      blockedQueue: [],
      terminatedQueue: [],
      ganttChart: [],
      metrics: {
        averageWaitingTime: 0,
        averageTurnaroundTime: 0,
        averageResponseTime: 0,
        cpuUtilization: 0,
        throughput: 0
      }
    });
  },

  // 单步执行
  stepSimulation: () => {
    set(state => ({
      currentTime: state.currentTime + 1
    }));
  },

  // 设置时间缩放
  setTimeScale: (scale: number) => {
    set({ timeScale: scale });
  },

  // 添加甘特图项
  addGanttItem: (item: GanttItem) => {
    set(state => ({
      ganttChart: [...state.ganttChart, item]
    }));
  },

  // 清空甘特图
  clearGanttChart: () => {
    set({ ganttChart: [] });
  },

  // 更新性能指标
  updateMetrics: () => {
    set(state => ({
      metrics: calculateMetrics(state.processes)
    }));
  }
}));
