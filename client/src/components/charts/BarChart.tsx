import { useState, useEffect } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  bars: Array<{
    dataKey: string;
    name?: string;
    color?: string;
    stackId?: string;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

const defaultColors = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
];

const BarChart = ({
  data,
  xAxisKey,
  bars,
  title,
  height = 300,
  showLegend = true,
  className = '',
}: BarChartProps) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState(data);

  // Update chart data when props data changes
  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
          />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
          />
          <YAxis
            tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
              borderRadius: '0.375rem',
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                color: theme === 'dark' ? '#F9FAFB' : '#111827',
              }}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || defaultColors[index % defaultColors.length]}
              stackId={bar.stackId}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;