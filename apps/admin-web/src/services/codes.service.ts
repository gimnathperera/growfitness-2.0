import { api } from './api';
import { PaginatedResponse } from '@grow-fitness/shared-types';

export interface Code {
  id: string;
  code: string;
  type: 'DISCOUNT' | 'PROMO' | 'REFERRAL';
  discountPercentage?: number;
  discountAmount?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiryDate?: Date | string;
  usageLimit: number;
  usageCount: number;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCodeDto {
  code: string;
  type: string;
  discountPercentage?: number;
  discountAmount?: number;
  expiryDate?: string;
  usageLimit: number;
  description?: string;
}

export interface UpdateCodeDto {
  status?: string;
  expiryDate?: string;
  usageLimit?: number;
  description?: string;
}

export const codesService = {
  getCodes: (page: number = 1, limit: number = 10) =>
    api.get<PaginatedResponse<Code>>(`/codes?page=${page}&limit=${limit}`),
  getCodeById: (id: string) => api.get<Code>(`/codes/${id}`),
  createCode: (data: CreateCodeDto) => api.post<Code>('/codes', data),
  updateCode: (id: string, data: UpdateCodeDto) => api.patch<Code>(`/codes/${id}`, data),
  deleteCode: (id: string) => api.delete<void>(`/codes/${id}`),
};

