import { api } from './api';
import type { Kid, PaginatedResponse, SessionType } from '@grow-fitness/shared-types';
import type { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';

export const kidsService = {
  getKids: (page: number = 1, limit: number = 10, parentId?: string, sessionType?: SessionType) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (parentId) params.append('parentId', parentId);
    if (sessionType) params.append('sessionType', sessionType);
    return api.get<PaginatedResponse<Kid>>(`/kids?${params.toString()}`);
  },
  getKidById: (id: string) => api.get<Kid>(`/kids/${id}`),
  createKid: (data: CreateKidDto) => api.post<Kid>('/kids', data),
  updateKid: (id: string, data: UpdateKidDto) => api.patch<Kid>(`/kids/${id}`, data),
  linkToParent: (kidId: string, parentId: string) =>
    api.post<Kid>(`/kids/${kidId}/link-parent`, { parentId }),
  unlinkFromParent: (kidId: string) => api.delete<Kid>(`/kids/${kidId}/unlink-parent`),
};
