import { api } from './api';
import type { Banner, PaginatedResponse } from '@grow-fitness/shared-types';

export const bannersService = {
  getBanners: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<Banner>>(`/banners?page=${page}&limit=${limit}`),
  getBannerById: (id: string) => api.get<Banner>(`/banners/${id}`),
};
