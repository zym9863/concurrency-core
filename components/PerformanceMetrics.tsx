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
    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-800">
          {value.toFixed(2)}
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </div>
      </div>
    </div>
    <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
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
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">性能指标</h2>
          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            {algorithmName}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>实时更新</span>
        </div>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="平均等待时间"
          value={metrics.averageWaitingTime}
          unit="ms"
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-red-500"
          description="进程在就绪队列中等待的平均时间"
        />
        
        <MetricCard
          title="平均周转时间"
          value={metrics.averageTurnaroundTime}
          unit="ms"
          icon={<Activity className="w-5 h-5 text-white" />}
          color="bg-blue-500"
          description="从进程提交到完成的平均时间"
        />
        
        <MetricCard
          title="平均响应时间"
          value={metrics.averageResponseTime}
          unit="ms"
          icon={<Zap className="w-5 h-5 text-white" />}
          color="bg-green-500"
          description="从进程提交到首次执行的平均时间"
        />
        
        <MetricCard
          title="CPU利用率"
          value={metrics.cpuUtilization}
          unit="%"
          icon={<Target className="w-5 h-5 text-white" />}
          color="bg-purple-500"
          description="CPU处于忙碌状态的时间百分比"
        />
        
        <MetricCard
          title="系统吞吐量"
          value={metrics.throughput}
          unit="个/ms"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-orange-500"
          description="单位时间内完成的进程数量"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 时间指标对比柱状图 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">时间指标对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} ms`, '时间']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 历史趋势图 */}
        {trendData.length > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">性能趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '时间点', position: 'insideBottom', offset: -5 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]}
                  labelFormatter={(label) => `时间点: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="等待时间" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="周转时间" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="响应时间" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 性能评估 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          性能评估
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="font-medium text-blue-700 mb-1">响应性能</div>
            <div className="text-blue-600">
              {metrics.averageResponseTime < 5 ? '优秀' : 
               metrics.averageResponseTime < 10 ? '良好' : 
               metrics.averageResponseTime < 20 ? '一般' : '需要优化'}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              响应时间: {metrics.averageResponseTime.toFixed(2)}ms
            </div>
          </div>
          
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="font-medium text-blue-700 mb-1">资源利用</div>
            <div className="text-blue-600">
              {metrics.cpuUtilization > 80 ? '优秀' : 
               metrics.cpuUtilization > 60 ? '良好' : 
               metrics.cpuUtilization > 40 ? '一般' : '需要优化'}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              CPU利用率: {metrics.cpuUtilization.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="font-medium text-blue-700 mb-1">整体效率</div>
            <div className="text-blue-600">
              {metrics.throughput > 0.1 ? '优秀' : 
               metrics.throughput > 0.05 ? '良好' : 
               metrics.throughput > 0.02 ? '一般' : '需要优化'}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              吞吐量: {metrics.throughput.toFixed(3)} 个/ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
