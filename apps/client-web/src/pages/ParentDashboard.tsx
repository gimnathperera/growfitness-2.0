import { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';

import { DesktopTabs } from '@/components/common/DashboardTabs';
import { MobileTabNav } from '@/components/common/footerTabNavbar';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { OverviewTab } from '@/components/client-dashboard/OverviewTab';
import { AchievementsTab } from '@/components/client-dashboard/achievements/AchievementsTab';
import ScheduleTab from '@/components/client-dashboard/schedule/ScheduleTab';
import { SessionType, UserRole, type Kid } from '@grow-fitness/shared-types';
import { useKid } from '@/contexts/kid/useKid';

import { kidsService } from '@/services/kids.service';
import { getTabsForUser } from '@/constants/dashboard';
import { KidProfileTab } from '@/components/client-dashboard/KidProfileTab';
import { useAuth } from '@/contexts/useAuth';

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [kidData, setKidData] = useState<Kid | null>(null);
  const [isKidDataLoading, setIsKidDataLoading] = useState(false);

  const { selectedKid, isLoading: isKidLoading } = useKid();
  const { user, isLoading: isAuthLoading } = useAuth();

  const selectedKidId = selectedKid?.id;

  useEffect(() => {
    if (!selectedKidId) return;

    const fetchKidData = async () => {
      setIsKidDataLoading(true);
      try {
        const response = await kidsService.getKidById(selectedKidId);
        setKidData(response);
      } catch {
        setKidData(null);
      } finally {
        setIsKidDataLoading(false);
      }
    };

    fetchKidData();
  }, [selectedKidId]);

  const kidTypeForTabs =
    kidData?.sessionType === SessionType.GROUP
      ? ('GROUP' as const)
      : kidData?.sessionType === SessionType.INDIVIDUAL
        ? ('INDIVIDUAL' as const)
        : undefined;

  useEffect(() => {
    const resolved = getTabsForUser(user?.role as 'COACH' | 'PARENT', kidTypeForTabs);
    if (resolved.length && !resolved.some(t => t.id === activeTab)) {
      setActiveTab(resolved[0].id);
    }
  }, [user?.role, kidTypeForTabs, activeTab]);

  const isDashboardLoading = isAuthLoading || isKidLoading || isKidDataLoading;
  const showDashboard = Boolean(user && user.role === UserRole.PARENT && kidData);
  const tabs = showDashboard
    ? getTabsForUser(
        user!.role as 'COACH' | 'PARENT',
        kidData!.sessionType as 'GROUP' | 'INDIVIDUAL'
      )
    : [];

  return (
    <div className="space-y-6">
      <DashboardHeader />
      {isDashboardLoading ? (
        <div className="bg-gray-50 flex items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      ) : showDashboard && user && kidData ? (
        <>
          {/* ------------------ TAB COMPONENTS ------------------ */}
          <DesktopTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            kidType={kidData.sessionType}
          >
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6 pb-20 md:pb-6">
                {tab.id === 'overview' && <OverviewTab kid={kidData} />}
                {tab.id === 'schedule' && <ScheduleTab />}
                {tab.id === 'achievements' && <AchievementsTab />}
                {tab.id === 'kidProfile' && <KidProfileTab />}
              </TabsContent>
            ))}
          </DesktopTabs>

          <MobileTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={UserRole.PARENT}
            kidType={kidData.sessionType}
          />
        </>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
          <div className="text-gray-500">
            Please select a child to continue.
          </div>
        </div>
      )}
    </div>
  );
}
