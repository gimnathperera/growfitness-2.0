import { NavLink } from 'react-router-dom';
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
  Shield,
  Code,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/kids', label: 'Kids', icon: Baby },
  { path: '/sessions', label: 'Sessions', icon: Calendar },
  { path: '/requests', label: 'Requests', icon: FileText },
  { path: '/invoices', label: 'Invoices', icon: Banknote },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/banners', label: 'Banners', icon: Image },
  { path: '/testimonials', label: 'Testimonials', icon: MessageCircle },
  { path: '/audit', label: 'Audit', icon: Shield },
  { path: '/codes', label: 'Codes', icon: Code },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar-background border-r border-border flex flex-col">
      <div className="p-6 border-b border-border/20">
        <h1 className="text-xl font-bold text-sidebar-text">Grow Fitness</h1>
        <p className="text-sm text-sidebar-icon-inactive">Admin Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-text [&_svg]:text-sidebar-icon-active'
                    : 'text-sidebar-text hover:bg-sidebar-hover [&_svg]:text-sidebar-icon-inactive'
                )
              }
            >
              <Icon className="h-5 w-5 transition-colors" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
