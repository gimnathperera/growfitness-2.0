import { api } from './api';
import { Banner, PaginatedResponse } from '@grow-fitness/shared-types';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from '@grow-fitness/shared-schemas';

export const bannersService = {
  getBanners: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<Banner>>(`/banners?page=${page}&limit=${limit}`),
  getBannerById: (id: string) => api.get<Banner>(`/banners/${id}`),
  createBanner: (data: CreateBannerDto) => api.post<Banner>('/banners', data),
  updateBanner: (id: string, data: UpdateBannerDto) => api.patch<Banner>(`/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete<void>(`/banners/${id}`),
  reorderBanners: (data: ReorderBannersDto) => api.patch<void>('/banners/reorder', data),
};
