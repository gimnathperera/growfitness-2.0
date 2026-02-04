import { api } from './api';
import { Report, PaginatedResponse, ReportType, ReportStatus } from '@grow-fitness/shared-types';
import { CreateReportDto, GenerateReportDto } from '@grow-fitness/shared-schemas';

export const reportsService = {
  getReports: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      type?: ReportType;
      status?: ReportStatus;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    return api.get<PaginatedResponse<Report>>(`/reports?${params.toString()}`);
  },

  getReportById: (id: string) => api.get<Report>(`/reports/${id}`),

  createReport: (data: CreateReportDto) => api.post<Report>('/reports', data),

  generateReport: (data: GenerateReportDto) => api.post<Report>('/reports/generate', data),

  deleteReport: (id: string) => api.delete<void>(`/reports/${id}`),

  exportCSV: (id: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
    return fetch(`${API_BASE_URL}/reports/${id}/export/csv`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => Promise.reject(err));
      }
      return res.blob();
    });
  },
};
