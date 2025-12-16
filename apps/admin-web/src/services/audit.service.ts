import { api } from './api';
import { AuditLog, PaginatedResponse } from '@grow-fitness/shared-types';

export const auditService = {
  getAuditLogs: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      actorId?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.actorId) params.append('actorId', filters.actorId);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return api.get<PaginatedResponse<AuditLog>>(`/audit?${params.toString()}`);
  },
};
