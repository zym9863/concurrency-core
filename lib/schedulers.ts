import { Process, Scheduler, SchedulingConfig, SchedulingAlgorithm } from '@/types/process';

/**
 * 先来先服务(FCFS)调度算法
 */
export class FCFSScheduler implements Scheduler {
  getName(): string {
    return '先来先服务 (FCFS)';
  }

  getDescription(): string {
    return '按照进程到达的先后顺序进行调度，先到达的进程先执行。这是最简单的调度算法，但可能导致短作业等待时间过长。';
  }

  selectNext(readyQueue: Process[]): Process | null {
    if (readyQueue.length === 0) return null;
    
    // 按到达时间排序，选择最早到达的进程
    return readyQueue.reduce((earliest, current) => 
      current.arrivalTime < earliest.arrivalTime ? current : earliest
    );
  }

  shouldPreempt(): boolean {
    // FCFS是非抢占式调度
    return false;
  }
}

/**
 * 短作业优先(SJF)调度算法
 */
export class SJFScheduler implements Scheduler {
  getName(): string {
    return '短作业优先 (SJF)';
  }

  getDescription(): string {
    return '优先调度执行时间最短的进程。可以最小化平均等待时间，但可能导致长作业饥饿问题。';
  }

  selectNext(readyQueue: Process[]): Process | null {
    if (readyQueue.length === 0) return null;
    
    // 选择剩余执行时间最短的进程
    return readyQueue.reduce((shortest, current) => 
      current.remainingTime < shortest.remainingTime ? current : shortest
    );
  }

  shouldPreempt(currentProcess: Process, readyQueue: Process[], config: SchedulingConfig): boolean {
    if (!config.preemptive || readyQueue.length === 0) return false;
    
    // 如果有更短的作业到达，则抢占
    const shortestInQueue = readyQueue.reduce((shortest, current) => 
      current.remainingTime < shortest.remainingTime ? current : shortest
    );
    
    return shortestInQueue.remainingTime < currentProcess.remainingTime;
  }
}

/**
 * 优先级调度算法
 */
export class PriorityScheduler implements Scheduler {
  getName(): string {
    return '优先级调度 (Priority)';
  }

  getDescription(): string {
    return '根据进程的优先级进行调度，优先级高的进程先执行。数字越小优先级越高。可能导致低优先级进程饥饿。';
  }

  selectNext(readyQueue: Process[]): Process | null {
    if (readyQueue.length === 0) return null;
    
    // 选择优先级最高的进程（数字越小优先级越高）
    return readyQueue.reduce((highest, current) => {
      if (current.priority < highest.priority) return current;
      if (current.priority === highest.priority) {
        // 优先级相同时，选择到达时间更早的
        return current.arrivalTime < highest.arrivalTime ? current : highest;
      }
      return highest;
    });
  }

  shouldPreempt(currentProcess: Process, readyQueue: Process[], config: SchedulingConfig): boolean {
    if (!config.preemptive || readyQueue.length === 0) return false;
    
    // 如果有更高优先级的进程到达，则抢占
    const highestInQueue = readyQueue.reduce((highest, current) => 
      current.priority < highest.priority ? current : highest
    );
    
    return highestInQueue.priority < currentProcess.priority;
  }
}

/**
 * 时间片轮转(Round Robin)调度算法
 */
export class RoundRobinScheduler implements Scheduler {
  getName(): string {
    return '时间片轮转 (Round Robin)';
  }

  getDescription(): string {
    return '为每个进程分配固定的时间片，时间片用完后切换到下一个进程。保证了公平性，适合交互式系统。';
  }

  selectNext(readyQueue: Process[]): Process | null {
    if (readyQueue.length === 0) return null;
    
    // 选择队列中的第一个进程（FIFO顺序）
    return readyQueue[0];
  }

  shouldPreempt(currentProcess: Process, readyQueue: Process[], config: SchedulingConfig): boolean {
    // 时间片轮转总是抢占式的，但抢占逻辑由时间片控制器处理
    return false;
  }
}

/**
 * 调度器工厂类
 */
export class SchedulerFactory {
  private static schedulers: Map<SchedulingAlgorithm, Scheduler> = new Map([
    [SchedulingAlgorithm.FCFS, new FCFSScheduler()],
    [SchedulingAlgorithm.SJF, new SJFScheduler()],
    [SchedulingAlgorithm.PRIORITY, new PriorityScheduler()],
    [SchedulingAlgorithm.ROUND_ROBIN, new RoundRobinScheduler()]
  ]);

  /**
   * 获取指定算法的调度器实例
   */
  static getScheduler(algorithm: SchedulingAlgorithm): Scheduler {
    const scheduler = this.schedulers.get(algorithm);
    if (!scheduler) {
      throw new Error(`未知的调度算法: ${algorithm}`);
    }
    return scheduler;
  }

  /**
   * 获取所有可用的调度算法
   */
  static getAvailableAlgorithms(): { value: SchedulingAlgorithm; label: string; description: string }[] {
    return Array.from(this.schedulers.entries()).map(([algorithm, scheduler]) => ({
      value: algorithm,
      label: scheduler.getName(),
      description: scheduler.getDescription()
    }));
  }
}

/**
 * 调度引擎类 - 负责执行调度逻辑
 */
export class SchedulingEngine {
  private currentTimeQuantum = 0;

  /**
   * 执行一个时间单位的调度
   */
  executeTimeSlice(
    processes: Process[],
    readyQueue: string[],
    runningProcess: string | null,
    config: SchedulingConfig,
    currentTime: number
  ): {
    newRunningProcess: string | null;
    updatedReadyQueue: string[];
    shouldPreempt: boolean;
    timeQuantumExpired: boolean;
  } {
    const scheduler = SchedulerFactory.getScheduler(config.algorithm);
    const readyProcesses = readyQueue.map(id => processes.find(p => p.id === id)!).filter(Boolean);
    const currentProcess = runningProcess ? processes.find(p => p.id === runningProcess) : null;

    let shouldPreempt = false;
    let timeQuantumExpired = false;
    let newRunningProcess = runningProcess;
    let updatedReadyQueue = [...readyQueue];

    // 检查时间片是否用完（仅适用于时间片轮转）
    if (config.algorithm === SchedulingAlgorithm.ROUND_ROBIN && currentProcess) {
      this.currentTimeQuantum++;
      if (this.currentTimeQuantum >= (config.timeQuantum || 2)) {
        timeQuantumExpired = true;
        shouldPreempt = true;
        this.currentTimeQuantum = 0;
      }
    }

    // 检查是否需要抢占
    if (currentProcess && !shouldPreempt) {
      shouldPreempt = scheduler.shouldPreempt(currentProcess, readyProcesses, config);
    }

    // 如果需要抢占或当前没有运行进程，选择下一个进程
    if (shouldPreempt || !currentProcess) {
      if (currentProcess && shouldPreempt) {
        // 将当前进程放回就绪队列
        if (config.algorithm === SchedulingAlgorithm.ROUND_ROBIN) {
          // 时间片轮转：放到队列末尾
          updatedReadyQueue.push(currentProcess.id);
        } else {
          // 其他算法：保持原有顺序
          updatedReadyQueue.unshift(currentProcess.id);
        }
      }

      // 选择下一个进程
      const nextProcess = scheduler.selectNext(readyProcesses);
      if (nextProcess) {
        newRunningProcess = nextProcess.id;
        updatedReadyQueue = updatedReadyQueue.filter(id => id !== nextProcess.id);
        this.currentTimeQuantum = 0; // 重置时间片计数器
      } else {
        newRunningProcess = null;
      }
    }

    return {
      newRunningProcess,
      updatedReadyQueue,
      shouldPreempt,
      timeQuantumExpired
    };
  }

  /**
   * 重置调度引擎状态
   */
  reset(): void {
    this.currentTimeQuantum = 0;
  }
}
