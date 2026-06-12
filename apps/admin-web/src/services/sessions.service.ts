import { api } from './api';
import { Session, PaginatedResponse, SessionStatus } from '@grow-fitness/shared-types';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CreateRecurringSessionDto,
} from '@grow-fitness/shared-schemas';

interface CreateRecurringSessionsResponse {
  created: number;
  recurringGroupId: string;
  sessions: Session[];
}

export type SessionSortField = 'title' | 'dateTime' | 'type' | 'duration' | 'status' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

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
      sortBy?: SessionSortField;
      sortOrder?: SortOrder;
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
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    return api.get<PaginatedResponse<Session>>(`/sessions?${params.toString()}`);
  },
  getSessionById: (id: string) => api.get<Session>(`/sessions/${id}`),
  createSession: (data: CreateSessionDto) => api.post<Session>('/sessions', data),
  createRecurringSessions: (data: CreateRecurringSessionDto) =>
    api.post<CreateRecurringSessionsResponse>('/sessions/recurring', data),
  updateSession: (id: string, data: UpdateSessionDto) =>
    api.patch<Session>(`/sessions/${id}`, data),
  deleteSession: (id: string) => api.delete<void>(`/sessions/${id}`),
};
