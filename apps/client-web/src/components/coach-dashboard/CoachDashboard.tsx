import { useState } from "react";
import { DesktopTabs } from "../common/DashboardTabs";
import { MobileTabNav } from "../common/footerTabNavbar";
import { useAuth } from "@/contexts/useAuth";
import { TabsContent } from "../ui/tabs";
import { getTabsForUser } from "@/constants/dashboard";
import { UserRole } from "@grow-fitness/shared-types";
import { OverviewTab } from "./OverviewTab";
import ScheduleTab from "./ScheduleTab";
import SessionsTab from "./KidsTab";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const tabs = getTabsForUser(UserRole.COACH);

  const tabComponents: Record<string, JSX.Element> = {
    overview: <OverviewTab />,
    sessions: <SessionsTab />,
    schedule: <ScheduleTab/>,
  };

  return (
    <div className="min-h-screen bg-white">
      <DesktopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
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
        user={UserRole.COACH}      />
    </div>
  );
}
