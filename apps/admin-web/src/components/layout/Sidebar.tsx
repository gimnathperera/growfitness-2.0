import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  Calendar,
  FileText,
  DollarSign,
  MapPin,
  Image,
  Shield,
  Code,
  BookOpen,
  HelpCircle,
  UsersRound,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/kids', label: 'Kids', icon: Baby },
  { path: '/sessions', label: 'Sessions', icon: Calendar },
  { path: '/requests', label: 'Requests', icon: FileText },
  { path: '/invoices', label: 'Invoices', icon: DollarSign },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/banners', label: 'Banners', icon: Image },
  { path: '/audit', label: 'Audit', icon: Shield },
  { path: '/codes', label: 'Codes', icon: Code },
  { path: '/resources', label: 'Resources', icon: BookOpen },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/crm', label: 'CRM', icon: UsersRound },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">Grow Fitness</h1>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

