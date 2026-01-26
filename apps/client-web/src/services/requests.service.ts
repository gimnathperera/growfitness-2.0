import { api } from './api';
import type {
  FreeSessionRequest,
  RescheduleRequest,
  ExtraSessionRequest,
  PaginatedResponse,
} from '@grow-fitness/shared-types';

export const requestsService = {
  // Free Session Requests
  getFreeSessionRequests: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<FreeSessionRequest>>(
      `/requests/free-sessions?page=${page}&limit=${limit}`
    ),
  selectFreeSessionRequest: (id: string, sessionId?: string) =>
    api.post<FreeSessionRequest>(`/requests/free-sessions/${id}/select`, { sessionId }),
  updateFreeSessionRequest: (id: string, data: { status: string; selectedSessionId?: string }) =>
    api.patch<FreeSessionRequest>(`/requests/free-sessions/${id}`, data),

  // Reschedule Requests
  getRescheduleRequests: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<RescheduleRequest>>(
      `/requests/reschedules?page=${page}&limit=${limit}`
    ),
  approveRescheduleRequest: (id: string) =>
    api.post<RescheduleRequest>(`/requests/reschedules/${id}/approve`),
  denyRescheduleRequest: (id: string) =>
    api.post<RescheduleRequest>(`/requests/reschedules/${id}/deny`),

  // Extra Session Requests
  getExtraSessionRequests: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<ExtraSessionRequest>>(
      `/requests/extra-sessions?page=${page}&limit=${limit}`
    ),
  approveExtraSessionRequest: (id: string) =>
    api.post<ExtraSessionRequest>(`/requests/extra-sessions/${id}/approve`),
  denyExtraSessionRequest: (id: string) =>
    api.post<ExtraSessionRequest>(`/requests/extra-sessions/${id}/deny`),
};
