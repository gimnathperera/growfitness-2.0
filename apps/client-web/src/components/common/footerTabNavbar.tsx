import { getTabsForUser } from '@/constants/dashboard';
import type { ComponentType, SVGProps } from 'react';

import type { SessionType, UserRole } from '@grow-fitness/shared-types';
import { FloatingDock } from './FloatingDock';

interface MobileTabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserRole;
  kidType?: SessionType;
}

type TabItem = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function MobileTabNav({
  activeTab,
  onTabChange,
  user,
  kidType,
}: MobileTabNavProps) {
  // Convert SessionType enum to string literals
  const kidTypeStr = kidType === 'GROUP' 
    ? 'GROUP' as const
    : kidType === 'INDIVIDUAL' 
    ? 'INDIVIDUAL' as const
    : undefined;

  const tabs = getTabsForUser(user as 'COACH' | 'PARENT', kidTypeStr);

  const dockItems = (tabs as TabItem[]).map((tab) => ({
    title: tab.label,
    icon: <tab.icon className="h-5 w-5" />,
    href: `#${tab.id}`,
    id: tab.id,
  }));

  const handleItemClick = (item: { id?: string }) => {
    if (item.id) {
      onTabChange(item.id);
    }
  };

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <FloatingDock
        items={dockItems}
        mobileClassName=""
        desktopClassName=""
        onItemClick={handleItemClick}
        activeTab={activeTab}
      />
    </div>
  );
}