import ParentDashboard from '@/pages/ParentDashboard';
import { useAuth } from '@/contexts/useAuth';
import CoachDashboardPage from '@/pages/CoachDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'PARENT') {
    return <ParentDashboard />;
  }

  if (user?.role === 'COACH') {
    return <CoachDashboardPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
