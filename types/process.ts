/**
 * 进程/线程状态枚举
 */
export enum ProcessState {
  NEW = 'new',           // 新建状态
  READY = 'ready',       // 就绪状态
  RUNNING = 'running',   // 运行状态
  BLOCKED = 'blocked',   // 阻塞状态
  TERMINATED = 'terminated' // 终止状态
}

/**
 * 调度算法类型枚举
 */
export enum SchedulingAlgorithm {
  FCFS = 'fcfs',         // 先来先服务
  SJF = 'sjf',           // 短作业优先
  PRIORITY = 'priority', // 优先级调度
  ROUND_ROBIN = 'rr'     // 时间片轮转
}

/**
 * 进程/线程基础接口
 */
export interface Process {
  id: string;                    // 唯一标识符
  pid: number;                   // 进程ID
  name: string;                  // 进程名称
  state: ProcessState;           // 当前状态
  priority: number;              // 优先级 (1-10, 数字越小优先级越高)
  arrivalTime: number;           // 到达时间
  burstTime: number;             // 需要的CPU执行时间
  remainingTime: number;         // 剩余执行时间
  waitingTime: number;           // 等待时间
  turnaroundTime: number;        // 周转时间
  startTime?: number;            // 开始执行时间
  completionTime?: number;       // 完成时间
  createdAt: number;             // 创建时间戳
  lastStateChange: number;       // 最后状态变更时间
  threads: Thread[];             // 子线程列表
  color: string;                 // 显示颜色
}

/**
 * 线程接口
 */
export interface Thread {
  id: string;                    // 唯一标识符
  tid: number;                   // 线程ID
  parentPid: number;             // 父进程ID
  name: string;                  // 线程名称
  state: ProcessState;           // 当前状态
  priority: number;              // 优先级
  arrivalTime: number;           // 到达时间
  burstTime: number;             // 需要的CPU执行时间
  remainingTime: number;         // 剩余执行时间
  waitingTime: number;           // 等待时间
  turnaroundTime: number;        // 周转时间
  startTime?: number;            // 开始执行时间
  completionTime?: number;       // 完成时间
  createdAt: number;             // 创建时间戳
  lastStateChange: number;       // 最后状态变更时间
  color: string;                 // 显示颜色
}

/**
 * 调度算法配置接口
 */
export interface SchedulingConfig {
  algorithm: SchedulingAlgorithm;
  timeQuantum?: number;          // 时间片大小（用于轮转调度）
  preemptive?: boolean;          // 是否抢占式
}

/**
 * 甘特图数据项接口
 */
export interface GanttItem {
  processId: string;             // 进程/线程ID
  processName: string;           // 进程/线程名称
  startTime: number;             // 开始时间
  endTime: number;               // 结束时间
  color: string;                 // 显示颜色
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  averageWaitingTime: number;    // 平均等待时间
  averageTurnaroundTime: number; // 平均周转时间
  averageResponseTime: number;   // 平均响应时间
  cpuUtilization: number;        // CPU利用率
  throughput: number;            // 吞吐量
}

/**
 * 模拟器状态接口
 */
export interface SimulatorState {
  isRunning: boolean;            // 是否正在运行
  isPaused: boolean;             // 是否暂停
  currentTime: number;           // 当前时间
  timeScale: number;             // 时间缩放比例
  processes: Process[];          // 进程列表
  readyQueue: string[];          // 就绪队列
  runningProcess: string | null; // 当前运行的进程ID
  blockedQueue: string[];        // 阻塞队列
  terminatedQueue: string[];     // 终止队列
  ganttChart: GanttItem[];       // 甘特图数据
  metrics: PerformanceMetrics;   // 性能指标
  config: SchedulingConfig;      // 调度配置
}

/**
 * 调度算法接口
 */
export interface Scheduler {
  /**
   * 选择下一个要执行的进程
   */
  selectNext(readyQueue: Process[], config: SchedulingConfig): Process | null;
  
  /**
   * 检查是否需要抢占当前进程
   */
  shouldPreempt(currentProcess: Process, readyQueue: Process[], config: SchedulingConfig): boolean;
  
  /**
   * 获取算法名称
   */
  getName(): string;
  
  /**
   * 获取算法描述
   */
  getDescription(): string;
}

/**
 * 事件类型枚举
 */
export enum EventType {
  PROCESS_CREATED = 'process_created',
  PROCESS_STARTED = 'process_started',
  PROCESS_BLOCKED = 'process_blocked',
  PROCESS_UNBLOCKED = 'process_unblocked',
  PROCESS_TERMINATED = 'process_terminated',
  TIME_QUANTUM_EXPIRED = 'time_quantum_expired',
  IO_REQUEST = 'io_request',
  IO_COMPLETED = 'io_completed'
}

/**
 * 事件接口
 */
export interface SimulationEvent {
  id: string;                    // 事件ID
  type: EventType;               // 事件类型
  processId: string;             // 相关进程ID
  timestamp: number;             // 事件时间戳
  data?: any;                    // 附加数据
}
