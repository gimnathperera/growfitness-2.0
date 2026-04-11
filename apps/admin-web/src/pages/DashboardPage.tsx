import { useApiQuery } from '@/hooks/useApiQuery';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardStats } from '@/services/dashboard.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards';
import { WeeklySessionsChart } from '@/components/dashboard/WeeklySessionsChart';
import { FinanceSummary } from '@/components/dashboard/FinanceSummary';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TodaysSessions } from '@/components/dashboard/TodaysSessions';
import { RecentStudents } from '@/components/dashboard/RecentStudents';

export function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useApiQuery<DashboardStats>(['dashboard', 'stats'], () => dashboardService.getStats());

  const { data: weeklySessions, isLoading: weeklyLoading } = useApiQuery(
    ['dashboard', 'weekly-sessions'],
    () => dashboardService.getWeeklySessions()
  );

  const { data: finance, isLoading: financeLoading } = useApiQuery(['dashboard', 'finance'], () =>
    dashboardService.getFinanceSummary()
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return <ErrorState title="Failed to load dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Grow Fitness Platform Overview</p>
        </div>
      </div>

      {stats && <DashboardStatsCards stats={stats} />}

      <div className="grid gap-6 grid-cols-1">
        <TodaysSessions />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklySessionsChart data={weeklySessions || []} isLoading={weeklyLoading} />
        </div>
        <div className="space-y-6">
          <RecentStudents />
          <FinanceSummary data={finance} isLoading={financeLoading} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <RecentActivity />
      </div>
    </div>
  );
}
