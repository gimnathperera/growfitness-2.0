import { api } from './api';
import type { Session, PaginatedResponse, SessionStatus } from '@grow-fitness/shared-types';
import type { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';

export const sessionsService = {
  getSessions: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      coachId?: string;
      locationId?: string;
      status?: SessionStatus;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.coachId) params.append('coachId', filters.coachId);
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return api.get<PaginatedResponse<Session>>(`/sessions?${params.toString()}`);
  },
  getSessionById: (id: string) => api.get<Session>(`/sessions/${id}`),
  createSession: (data: CreateSessionDto) => api.post<Session>('/sessions', data),
  updateSession: (id: string, data: UpdateSessionDto) =>
    api.patch<Session>(`/sessions/${id}`, data),
  deleteSession: (id: string) => api.delete<void>(`/sessions/${id}`),
};
