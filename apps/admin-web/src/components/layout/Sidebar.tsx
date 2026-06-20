import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Baby,
  Calendar,
  FileText,
  Banknote,
  MapPin,
  Image,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BRAND = '#0b3b2c';
const ACTIVE = '#145c45'; // lighter green for selected state

type MenuItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/kids', label: 'Kids', icon: Baby },
  { path: '/sessions', label: 'Sessions', icon: Calendar },
  { path: '/requests', label: 'Requests', icon: FileText },
  { path: '/invoices', label: 'Invoices', icon: Banknote },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/banners', label: 'Banners', icon: Image },
  { path: '/testimonials', label: 'Testimonials', icon: MessageCircle },
];

export function Sidebar() {
  return (
    <aside
      className="w-64 flex flex-col text-white border-r border-white/10"
      style={{ backgroundColor: BRAND }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">Grow Fitness</h1>
        <p className="text-sm text-white/60">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 sm:space-y-2 lg:space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-lg font-medium transition-all duration-200',

                  isActive
                    ? 'text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? ACTIVE : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="h-5 w-5 transition-colors"
                    color={isActive ? 'white' : 'white'}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

