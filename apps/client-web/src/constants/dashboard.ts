import {
  Calendar,
  Home,
  MessageCircle,
  TrendingUp,
  User,
  Plus,
  Users,
  Trophy,
  BookOpen,
  Target,
} from 'lucide-react';

/* =========================
   Dashboard Tabs
========================= */

// Coach Tabs
export const coachTabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'kids', label: 'kids', icon: User },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'invoice', label: 'Invoice', icon: TrendingUp },
];

// Parent Tabs (Individual Kid)
export const parentIndividualTabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'kidProfile', label: 'Kid Profile', icon: User },
];

// Parent Tabs (Group Kid)
export const parentGroupTabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'kidProfile', label: 'Kid Profile', icon: User },
];

/* =========================
   Quick Actions
========================= */

// Coach Quick Actions
export const coachQuickActions = [
  { icon: Plus, label: 'Add Session', primary: true },
  { icon: Users, label: 'View Students' },
  { icon: MessageCircle, label: 'Send Message' },
  { icon: Trophy, label: 'Award Badge' },
];

// Parent Quick Actions
export const parentQuickActions = [
  { icon: Calendar, label: 'Book Session', primary: true },
  { icon: BookOpen, label: 'View Progress' },
  { icon: MessageCircle, label: 'Message Coach' },
  { icon: Target, label: 'Set Goals' },
];

/* =========================
   Tab Resolver
========================= */

export function getTabsForUser(
  role: 'COACH' | 'PARENT',
  kidType?: 'GROUP' | 'INDIVIDUAL'
) {
  if (role === 'COACH') return coachTabs;

  if (role === 'PARENT') {
    if (kidType === 'GROUP') return parentGroupTabs;
    if (kidType === 'INDIVIDUAL') return parentIndividualTabs;
  }

  return [];
}
