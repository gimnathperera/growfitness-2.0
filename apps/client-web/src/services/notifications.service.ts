import { api } from './api';
import { NotificationType } from '@grow-fitness/shared-types';
import type { PaginatedResponse } from '@grow-fitness/shared-types';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: (page: number = 1, limit: number = 20, read?: boolean) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (read !== undefined) params.set('read', String(read));
    return api.get<PaginatedResponse<Notification>>(`/notifications?${params.toString()}`);
  },
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.patch<{ count: number }>('/notifications/read-all'),
  deleteOne: (id: string) =>
    api.delete<void>(`/notifications/${id}`),
  clearAll: () =>
    api.delete<{ deletedCount: number }>('/notifications/clear-all'),
};
