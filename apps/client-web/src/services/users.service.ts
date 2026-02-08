import { api } from './api';
import type { User, PaginatedResponse } from '@grow-fitness/shared-types';
import type {
    CreateParentDto,
    UpdateParentDto,
    CreateCoachDto,
    UpdateCoachDto,
} from '@grow-fitness/shared-schemas';

export const usersService = {
  // Parents
  getParents: (page: number = 1, limit: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    return api.get<PaginatedResponse<User>>(`/users/parents?${params.toString()}`);
  },
  getParentById: (id: string) => api.get<User>(`/users/parents/${id}`),
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
