[中文](README.md) | [English](README-EN.md)

# Concurrency Core Visualization Simulator

An interactive, Next.js-based simulator to visualize process scheduling and lifecycle management in operating systems.

## 🚀 Features

### 1. Process/Thread Lifecycle Visual Simulator
- Dynamic creation: create new processes via UI with custom parameters
- State queues visualization: ready queue, running, blocked, terminated
- Smooth animations for state transitions
- Details on click: PID, priority, burst time, etc.
- Manual control: block, wake, terminate processes

### 2. Interactive CPU Scheduling Algorithms
- Supported algorithms:
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF)
  - Priority Scheduling
  - Round Robin (RR)
- Live Gantt chart: dynamically generated and updated
- Performance metrics: average waiting time, turnaround time, response time
- Algorithm comparison: switch algorithms to compare results

### 3. Advanced
- Real-time monitor: current time, simulation status, process counts
- Speed control: adjustable (0.5x - 5x)
- Quick start: one-click sample processes
- Responsive UI: works across screen sizes

## 🛠️ Tech Stack

- Frontend: Next.js 15 + React 19
- State: Zustand
- Animation: Framer Motion
- Charts: Recharts
- Styling: Tailwind CSS
- Icons: Lucide React
- Package manager: pnpm

## 📦 Setup & Run

### Requirements
- Node.js 18+
- pnpm

### Install dependencies
```bash
pnpm install
```

### Start dev server
```bash
pnpm dev
```
Open http://localhost:3000 in your browser.

### Build for production
```bash
pnpm build
pnpm start
```

## 🎯 Usage Guide

### Quick Start
1. Create processes: click "Create Process" or use the Quick Start Guide
2. Choose an algorithm: from the top dropdown
3. Start simulation: click "Start"
4. Observe results: state changes, Gantt chart, and metrics

### Process Management
- Create: set name, burst time, priority, arrival time
- Control: manually block, wake, or terminate
- Monitor: watch transitions across queues

### Scheduling Algorithms
- FCFS: executes by arrival order, good for batch workloads
- SJF: favors short jobs, minimizes average waiting time
- Priority: executes by priority, supports preemption
- Round Robin: time-sliced fairness

### Performance Analysis
- Waiting time: time spent in ready queue
- Turnaround time: submitted-to-completed duration
- Response time: submitted-to-first-run duration
- CPU utilization: percent busy time
- Throughput: completed processes per unit time

## 📁 Project Structure

```
concurrency-core/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ProcessCard.tsx    # Process card
│   ├── ProcessQueue.tsx   # Process queues
│   ├── GanttChart.tsx     # Gantt chart
│   ├── PerformanceMetrics.tsx # Metrics
│   ├── ProcessCreationModal.tsx # Create modal
│   └── QuickStartGuide.tsx # Quick start
├── lib/                   # Utilities
│   └── schedulers.ts      # Scheduling algorithms
├── store/                 # State management
│   └── simulator.ts       # Simulator state
├── types/                 # Type definitions
│   └── process.ts         # Process types
└── public/               # Static assets
```

## 🔧 Development

### Code Style
- Biome for formatting and linting
- Strict TypeScript
- Functional React components

### Debugging
```bash
# Lint
pnpm lint

# Format
pnpm format
```

## 🎓 Educational Value

Great for:
- Operating Systems courses: scheduling algorithms
- CS education: visualizing abstractions
- Algorithm learning: compare scheduling strategies
- Systems design: understanding concurrency principles

## 🤝 Contributing

Issues and PRs are welcome!

## 📄 License

MIT License
