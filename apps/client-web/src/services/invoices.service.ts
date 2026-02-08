import { api } from './api';
import type { Invoice, PaginatedResponse, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import type { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';

export const invoicesService = {
  getInvoices: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      type?: InvoiceType;
      parentId?: string;
      coachId?: string;
      status?: InvoiceStatus;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.parentId) params.append('parentId', filters.parentId);
    if (filters?.coachId) params.append('coachId', filters.coachId);
    if (filters?.status) params.append('status', filters.status);
    return api.get<PaginatedResponse<Invoice>>(`/invoices?${params.toString()}`);
  },
  getInvoiceById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  createInvoice: (data: CreateInvoiceDto) => api.post<Invoice>('/invoices', data),
  updatePaymentStatus: (id: string, data: UpdateInvoicePaymentStatusDto) =>
    api.patch<Invoice>(`/invoices/${id}/payment-status`, data),
  exportCSV: (filters?: {
    type?: InvoiceType;
    parentId?: string;
    coachId?: string;
    status?: InvoiceStatus;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.parentId) params.append('parentId', filters.parentId);
    if (filters?.coachId) params.append('coachId', filters.coachId);
    if (filters?.status) params.append('status', filters.status);
    return fetch(`/api/invoices/export/csv?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }).then(res => res.blob());
  },
};
