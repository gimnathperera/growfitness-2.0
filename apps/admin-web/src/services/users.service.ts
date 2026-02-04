import { api } from './api';
import { User, PaginatedResponse, UserStatus } from '@grow-fitness/shared-types';
import {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';

export const usersService = {
  // Parents
  getParents: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    location?: string,
    status?: UserStatus
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (status) params.append('status', status);
    return api.get<PaginatedResponse<User>>(`/users/parents?${params.toString()}`);
  },
  getParentById: (id: string, includeUnapproved?: boolean) =>
    api.get<User>(`/users/parents/${id}${includeUnapproved ? '?includeUnapproved=true' : ''}`),
  createParent: (data: CreateParentDto) => api.post<User>('/users/parents', data),
  updateParent: (id: string, data: UpdateParentDto) =>
    api.patch<User>(`/users/parents/${id}`, data),
  deleteParent: (id: string) => api.delete<void>(`/users/parents/${id}`),

  // Coaches
  getCoaches: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    return api.get<PaginatedResponse<User>>(`/users/coaches?${params.toString()}`);
  },
  getCoachById: (id: string) => api.get<User>(`/users/coaches/${id}`),
  createCoach: (data: CreateCoachDto) => api.post<User>('/users/coaches', data),
  updateCoach: (id: string, data: UpdateCoachDto) => api.patch<User>(`/users/coaches/${id}`, data),
  deleteCoach: (id: string) => api.delete<void>(`/users/coaches/${id}`),
};
