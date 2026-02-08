export interface User {
  name: string;
  role: 'parent' | 'coach' | 'admin' | 'client' | 'team';
 kids?: Student[]
}

export interface Student {
  group: string;
  sessionType: string;
  id: number;
  name: string;
  age: number;
  progress: number;
  lastSession: string;
  status: 'active' | 'inactive';
  location?: string;
  contactNumber?: string;
  sessions?: Session[];
  currentMilestone?: Milestone;
  totalSessions?: number;
  bmi?: number;
  height?: number;
  weight?: number;
}

export interface Milestone {
  id: number;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  type: 'fitness' | 'wellness' | 'nutrition';
  title: string;
  description: string;
  status: 'completed' | 'pending';
  completedAt?: string;
}

export interface Session {
  id: number;
  name: string;
  time: string;
  studentsCount: number;
  status: 'next' | 'upcoming' | 'later';
  type?: 'individual' | 'group';
  location?: string;
  students?: string[];
  dates?: string[];
  coach?: string;
  messages?: Message[];
}

export interface Message {
  id: number;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  isUnread?: boolean;
}

export interface DashboardStats {
  totalStudents?: number;
  totalChildren?: number;
  todaySessions?: number;
  upcomingSessions?: number;
  monthlyHours?: number;
  weeklyProgress?: number;
  avgProgress?: number;
}
