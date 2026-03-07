import { api } from './api';

export type GoogleCalendarStatus = { connected: boolean };

export const googleCalendarService = {
  getStatus: () => api.get<GoogleCalendarStatus>('/users/me/calendar-status'),
  disconnect: () => api.post<GoogleCalendarStatus>('/auth/google/calendar/disconnect'),
  getAuthUrl: (redirectUri: string) =>
    api.get<{ url: string }>(
      `/auth/google/calendar?redirect_uri=${encodeURIComponent(redirectUri)}`
    ),
};

