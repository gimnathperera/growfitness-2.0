import { api } from './api';
import {
  FreeSessionRequest,
  RescheduleRequest,
  ExtraSessionRequest,
  UserRegistrationRequest,
  PaginatedResponse,
} from '@grow-fitness/shared-types';

export type RequestSortField =
  | 'parentName'
  | 'kidName'
  | 'email'
  | 'phone'
  | 'preferredDateTime'
  | 'sessionId'
  | 'newDateTime'
  | 'reason'
  | 'parent'
  | 'kid'
  | 'coach'
  | 'sessionType'
  | 'status'
  | 'createdAt';
export type SortOrder = 'asc' | 'desc';

function buildRequestParams(
  page: number,
  limit: number,
  sortBy?: RequestSortField,
  sortOrder?: SortOrder
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  return params.toString();
}

export const requestsService = {
  // Free Session Requests
  getFreeSessionRequests: (
    page: number = 1,
    limit: number = 10,
    sortBy?: RequestSortField,
    sortOrder?: SortOrder
  ) =>
    api.get<PaginatedResponse<FreeSessionRequest>>(
      `/requests/free-sessions?${buildRequestParams(page, limit, sortBy, sortOrder)}`
    ),
  selectFreeSessionRequest: (id: string, sessionId?: string) =>
    api.post<FreeSessionRequest>(`/requests/free-sessions/${id}/select`, { sessionId }),
  updateFreeSessionRequest: (id: string, data: { status: string; selectedSessionId?: string }) =>
    api.patch<FreeSessionRequest>(`/requests/free-sessions/${id}`, data),

  // Reschedule Requests
  getRescheduleRequests: (
    page: number = 1,
    limit: number = 10,
    sortBy?: RequestSortField,
    sortOrder?: SortOrder
  ) =>
    api.get<PaginatedResponse<RescheduleRequest>>(
      `/requests/reschedules?${buildRequestParams(page, limit, sortBy, sortOrder)}`
    ),
  approveRescheduleRequest: (id: string) =>
    api.post<RescheduleRequest>(`/requests/reschedules/${id}/approve`),
  denyRescheduleRequest: (id: string) =>
    api.post<RescheduleRequest>(`/requests/reschedules/${id}/deny`),

  // Extra Session Requests
  getExtraSessionRequests: (
    page: number = 1,
    limit: number = 10,
    sortBy?: RequestSortField,
    sortOrder?: SortOrder
  ) =>
    api.get<PaginatedResponse<ExtraSessionRequest>>(
      `/requests/extra-sessions?${buildRequestParams(page, limit, sortBy, sortOrder)}`
    ),
  approveExtraSessionRequest: (id: string, data?: { coachId: string }) =>
    api.post<ExtraSessionRequest>(`/requests/extra-sessions/${id}/approve`, data),
  denyExtraSessionRequest: (id: string) =>
    api.post<ExtraSessionRequest>(`/requests/extra-sessions/${id}/deny`),
  updateExtraSessionRequest: (
    id: string,
    data: { status?: string; preferredDateTime?: string; coachId?: string }
  ) => api.patch<ExtraSessionRequest>(`/requests/extra-sessions/${id}`, data),

  // User Registration Requests
  getUserRegistrationRequests: (
    page: number = 1,
    limit: number = 10,
    sortBy?: RequestSortField,
    sortOrder?: SortOrder
  ) =>
    api.get<PaginatedResponse<UserRegistrationRequest>>(
      `/requests/user-registrations?${buildRequestParams(page, limit, sortBy, sortOrder)}`
    ),
  approveUserRegistrationRequest: (id: string) =>
    api.post<UserRegistrationRequest>(`/requests/user-registrations/${id}/approve`),
  rejectUserRegistrationRequest: (id: string) =>
    api.post<UserRegistrationRequest>(`/requests/user-registrations/${id}/reject`),
};
