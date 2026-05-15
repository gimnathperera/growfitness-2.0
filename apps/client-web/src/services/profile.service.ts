import { api } from './api';
import type { User } from '@grow-fitness/shared-types';
import type { UpdateParentSelfDto } from '@grow-fitness/shared-schemas';

export const profileService = {
  getMyProfile: () => api.get<User>('/users/me/profile'),
  updateMyProfile: (data: UpdateParentSelfDto) =>
    api.patch<User>('/users/me/profile', data),
  /** Role-aware profile (parent or coach); preferred for coach portal. */
  getMe: () => api.get<User>('/users/me'),
  getMyCoachProfile: async (): Promise<User> => {
    const endpoints = ['/users/me', '/users/me/coach-profile', '/auth/me'] as const;
    let lastError: unknown;
    for (const path of endpoints) {
      try {
        return await api.get<User>(path);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  },
};
