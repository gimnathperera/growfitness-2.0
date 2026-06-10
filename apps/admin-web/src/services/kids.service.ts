import { api } from './api';
import { Kid, PaginatedResponse, SessionType } from '@grow-fitness/shared-types';
import { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';

export const kidsService = {
  getKids: (
    page: number = 1,
    limit: number = 10,
    parentId?: string,
    sessionType?: SessionType,
    search?: string,
    filters?: { gender?: string; minAge?: string; maxAge?: string },
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (parentId) params.append('parentId', parentId);
    if (sessionType) params.append('sessionType', sessionType);
    if (search) params.append('search', search);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.minAge) params.append('minAge', filters.minAge);
    if (filters?.maxAge) params.append('maxAge', filters.maxAge);
    return api.get<PaginatedResponse<Kid>>(`/kids?${params.toString()}`);
  },
  getKidById: (id: string) => api.get<Kid>(`/kids/${id}`),
  createKid: (data: CreateKidDto) => api.post<Kid>('/kids', data),
  updateKid: (id: string, data: UpdateKidDto) => api.patch<Kid>(`/kids/${id}`, data),
  linkToParent: (kidId: string, parentId: string) =>
    api.post<Kid>(`/kids/${kidId}/link-parent`, { parentId }),
  unlinkFromParent: (kidId: string) => api.delete<Kid>(`/kids/${kidId}/unlink-parent`),
};
