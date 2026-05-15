import { api } from './api';
import type { User } from '@grow-fitness/shared-types';
import type { UpdateParentSelfDto } from '@grow-fitness/shared-schemas';

export const profileService = {
  getMyProfile: () => api.get<User>('/users/me/profile'),
  updateMyProfile: (data: UpdateParentSelfDto) =>
    api.patch<User>('/users/me/profile', data),
};
