import { api, fetchAuthorizedBlob } from './api';
import { Invoice, PaginatedResponse, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';

export type InvoicePdfSentFilter = 'sent' | 'not_sent';
export type InvoiceSortField =
  | 'type'
  | 'recipient'
  | 'totalAmount'
  | 'status'
  | 'pdfEmailedAt'
  | 'dueDate'
  | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export const invoicesService = {
  getInvoices: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      type?: InvoiceType;
      parentId?: string;
      coachId?: string;
      status?: InvoiceStatus;
      pdfSent?: InvoicePdfSentFilter;
      sortBy?: InvoiceSortField;
      sortOrder?: SortOrder;
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
    if (filters?.pdfSent) params.append('pdfSent', filters.pdfSent);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
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
    pdfSent?: InvoicePdfSentFilter;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.parentId) params.append('parentId', filters.parentId);
    if (filters?.coachId) params.append('coachId', filters.coachId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.pdfSent) params.append('pdfSent', filters.pdfSent);
    return fetch(`/api/invoices/export/csv?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }).then(res => res.blob());
  },
  /** Server-generated PDF (Puppeteer + shared HTML template). */
  downloadInvoicePdf: (id: string) => fetchAuthorizedBlob(`/invoices/${id}/pdf`),
  /** Email PDF to parent or coach address on file; returns persisted pdfEmailedAt. */
  sendInvoicePdfEmail: (id: string) =>
    api.post<{ pdfEmailedAt: string }>(`/invoices/${id}/send-email`),
};
