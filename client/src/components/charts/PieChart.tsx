import { useState, useEffect } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  dataKey?: string;
  nameKey?: string;
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
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#8B5CF6', // violet-500
];

const PieChart = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  title,
  height = 300,
  showLegend = true,
  className = '',
}: PieChartProps) => {
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
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
              borderRadius: '0.375rem',
            }}
            formatter={(value, name) => [value, name]}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                color: theme === 'dark' ? '#F9FAFB' : '#111827',
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;