import { api } from './api';
import type { Location, PaginatedResponse } from '@grow-fitness/shared-types';
import type { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';

export const locationsService = {
  getLocations: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<Location>>(`/locations?page=${page}&limit=${limit}`),
  getLocationById: (id: string) => api.get<Location>(`/locations/${id}`),
  createLocation: (data: CreateLocationDto) => api.post<Location>('/locations', data),
  updateLocation: (id: string, data: UpdateLocationDto) =>
    api.patch<Location>(`/locations/${id}`, data),
  deleteLocation: (id: string) => api.delete<void>(`/locations/${id}`),
};
