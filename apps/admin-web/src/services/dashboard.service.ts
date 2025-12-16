import { api } from './api';
import { PaginatedResponse, AuditLog } from '@grow-fitness/shared-types';

export interface DashboardStats {
  todaysSessions: number;
  freeSessionRequests: number;
  rescheduleRequests: number;
  totalParents: number;
  totalCoaches: number;
  totalKids: number;
}

export interface WeeklySession {
  date: string;
  count: number;
}

export interface FinanceSummary {
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getWeeklySessions: () => api.get<WeeklySession[]>('/dashboard/weekly-sessions'),
  getFinanceSummary: () => api.get<FinanceSummary>('/dashboard/finance'),
  getActivityLogs: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<AuditLog>>(`/dashboard/activity-logs?page=${page}&limit=${limit}`),
};
