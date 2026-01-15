import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklySession } from '@/services/dashboard.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

interface WeeklySessionsChartProps {
  data: WeeklySession[];
  isLoading: boolean;
}

export function WeeklySessionsChart({ data, isLoading }: WeeklySessionsChartProps) {
  // Get chart color from CSS variable
  const chartColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const root = getComputedStyle(document.documentElement);
      const chart1Hsl = root.getPropertyValue('--chart-1').trim();
      return `hsl(${chart1Hsl})`;
    }
    return 'hsl(150, 25%, 19%)'; // Fallback to #243F36
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke={chartColor} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
