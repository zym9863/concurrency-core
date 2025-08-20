'use client';

import { motion } from 'framer-motion';
import { PerformanceMetrics } from '@/types/process';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, Zap, Activity, Target } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  historicalData?: PerformanceMetrics[];
  algorithmName?: string;
}

/**
 * 性能指标卡片组件
 */
const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  description 
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none"></div>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-soft relative`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            {icon}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {value.toFixed(2)}
          </div>
          <span className="text-sm font-medium text-slate-500 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1 rounded-lg">
            {unit}
          </span>
        </div>
      </div>
      <h3 className="font-bold text-slate-800 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

/**
 * 性能指标展示组件
 */
export default function PerformanceMetricsComponent({ 
  metrics, 
  historicalData = [],
  algorithmName = '当前算法'
}: PerformanceMetricsProps) {
  // 准备图表数据
  const chartData = [
    {
      name: '平均等待时间',
      value: metrics.averageWaitingTime,
      color: '#EF4444'
    },
    {
      name: '平均周转时间',
      value: metrics.averageTurnaroundTime,
      color: '#3B82F6'
    },
    {
      name: '平均响应时间',
      value: metrics.averageResponseTime,
      color: '#10B981'
    }
  ];

  // 历史趋势数据
  const trendData = historicalData.map((data, index) => ({
    time: index + 1,
    等待时间: data.averageWaitingTime,
    周转时间: data.averageTurnaroundTime,
    响应时间: data.averageResponseTime,
    CPU利用率: data.cpuUtilization
  }));

  return (
    <div className="space-y-8">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-soft">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                性能指标
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-4 py-1 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-soft">
                  {algorithmName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-slate-700">实时更新</span>
          </div>
        </div>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="平均等待时间"
          value={metrics.averageWaitingTime}
          unit="ms"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-red-500 to-rose-600"
          description="进程在就绪队列中等待的平均时间"
        />
        
        <MetricCard
          title="平均周转时间"
          value={metrics.averageTurnaroundTime}
          unit="ms"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-indigo-600"
          description="从进程提交到完成的平均时间"
        />
        
        <MetricCard
          title="平均响应时间"
          value={metrics.averageResponseTime}
          unit="ms"
          icon={<Zap className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-emerald-500 to-green-600"
          description="从进程提交到首次执行的平均时间"
        />
        
        <MetricCard
          title="CPU利用率"
          value={metrics.cpuUtilization}
          unit="%"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-violet-600"
          description="CPU处于忙碌状态的时间百分比"
        />
        
        <MetricCard
          title="系统吞吐量"
          value={metrics.throughput}
          unit="个/ms"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-amber-600"
          description="单位时间内完成的进程数量"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 时间指标对比柱状图 */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft">
          <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center space-x-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <span>时间指标对比</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} ms`, '时间']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 历史趋势图 */}
        {trendData.length > 1 && (
          <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center space-x-2">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              <span>性能趋势</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ value: '时间点', position: 'insideBottom', offset: -5, style: { fill: '#64748b' } }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]}
                  labelFormatter={(label) => `时间点: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="等待时间" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="周转时间" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="响应时间" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 性能评估 */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm rounded-2xl border border-white/40 p-6 shadow-soft">
        <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-soft">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span>性能评估</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/40">
            <div className="font-bold text-blue-700 mb-2 text-lg">响应性能</div>
            <div className={`font-bold text-lg ${
              metrics.averageResponseTime < 5 ? 'text-green-600' : 
              metrics.averageResponseTime < 10 ? 'text-blue-600' : 
              metrics.averageResponseTime < 20 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {metrics.averageResponseTime < 5 ? '优秀' : 
               metrics.averageResponseTime < 10 ? '良好' : 
               metrics.averageResponseTime < 20 ? '一般' : '需要优化'}
            </div>
            <div className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg px-3 py-1">
              响应时间: {metrics.averageResponseTime.toFixed(2)}ms
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white/80 to-green-50/60 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/40">
            <div className="font-bold text-green-700 mb-2 text-lg">资源利用</div>
            <div className={`font-bold text-lg ${
              metrics.cpuUtilization > 80 ? 'text-green-600' : 
              metrics.cpuUtilization > 60 ? 'text-blue-600' : 
              metrics.cpuUtilization > 40 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {metrics.cpuUtilization > 80 ? '优秀' : 
               metrics.cpuUtilization > 60 ? '良好' : 
               metrics.cpuUtilization > 40 ? '一般' : '需要优化'}
            </div>
            <div className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg px-3 py-1">
              CPU利用率: {metrics.cpuUtilization.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white/80 to-purple-50/60 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/40">
            <div className="font-bold text-purple-700 mb-2 text-lg">整体效率</div>
            <div className={`font-bold text-lg ${
              metrics.throughput > 0.1 ? 'text-green-600' : 
              metrics.throughput > 0.05 ? 'text-blue-600' : 
              metrics.throughput > 0.02 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {metrics.throughput > 0.1 ? '优秀' : 
               metrics.throughput > 0.05 ? '良好' : 
               metrics.throughput > 0.02 ? '一般' : '需要优化'}
            </div>
            <div className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg px-3 py-1">
              吞吐量: {metrics.throughput.toFixed(3)} 个/ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
