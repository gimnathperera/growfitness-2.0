import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";

import { DesktopTabs } from "@/components/common/DashboardTabs";
import { MobileTabNav } from "@/components/common/footerTabNavbar";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { OverviewTab } from "@/components/client-dashboard/OverviewTab";
import { AchievementsTab } from "@/components/client-dashboard/achievements/AchievementsTab";
import ScheduleTab from "@/components/client-dashboard/schedule/ScheduleTab";
import { SessionType, UserRole, type Kid } from "@grow-fitness/shared-types";
import { useKid } from "@/contexts/kid/useKid";

import { kidsService } from "@/services/kids.service";
import { getTabsForUser } from "@/constants/dashboard";
import { InvoicesTab } from "@/components/client-dashboard/InvoiceTab";
import { KidProfileTab } from "@/components/client-dashboard/KidProfileTab";
import { useAuth } from "@/contexts/useAuth";


export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [kidData, setKidData] = useState<Kid | null>(null);
  const [isKidDataLoading, setIsKidDataLoading] = useState(false);

  const { selectedKid, isLoading: isKidLoading } = useKid();
  const { user, isLoading: isAuthLoading } = useAuth();

  /* ------------------ FETCH KID ------------------ */
  useEffect(() => {
    const kidId = selectedKid?.id || selectedKid?.id;
    if (!kidId) return;

    const fetchKidData = async () => {
      setIsKidDataLoading(true);
      try {
        const response = await kidsService.getKidById(kidId);
        setKidData(response);
      } catch (err) {
        console.error("Failed to fetch kid data:", err);
        setKidData(null);
      } finally {
        setIsKidDataLoading(false);
      }
    };

    fetchKidData();
  }, [selectedKid]);

  /* ------------------ RESOLVE TABS ------------------ */
  // Convert SessionType enum to string literals for getTabsForUser
  const kidTypeForTabs = kidData?.sessionType === SessionType.GROUP 
    ? 'GROUP' as const
    : kidData?.sessionType === SessionType.INDIVIDUAL 
    ? 'INDIVIDUAL' as const
    : undefined;

  const tabs = getTabsForUser(user?.role as 'COACH' | 'PARENT', kidTypeForTabs);

  console.log('Active tabs:', tabs); // Debug log
  console.log('Kid session type:', kidData?.sessionType); // Debug log
  console.log('Kid type for tabs:', kidTypeForTabs); // Debug log

  /* ✅ KEEP ACTIVE TAB VALID (MUST BE BEFORE RETURNS) */
  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  /* ------------------ SAFEGUARDS ------------------ */
  if (isAuthLoading || isKidLoading || isKidDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex justify-center py-20 text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.PARENT || !kidData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex justify-center py-20 text-gray-500">
          Please select a child to continue.
        </div>
      </div>
    );
  }

  /* ------------------ TAB COMPONENTS ------------------ */
  const tabComponents: Record<string, JSX.Element> = {
    overview: <OverviewTab kid={kidData} />,
    achievements: <AchievementsTab />,
    schedule: <ScheduleTab kid={kidData} />,
    invoice: <InvoicesTab kidId={kidData.id} />,
    kidProfile: <KidProfileTab/>,
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <DesktopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        kidType={kidData.sessionType}
      >
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="space-y-6 pb-20 md:pb-6"
          >
            {tabComponents[tab.id]}
          </TabsContent>
        ))}
      </DesktopTabs>

      <MobileTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={UserRole.PARENT}
        kidType={kidData.sessionType}
      />
    </div>
  );
}