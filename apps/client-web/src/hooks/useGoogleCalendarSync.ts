import { useCallback, useEffect, useState } from 'react';
import { googleCalendarService } from '@/services/google-calendar.service';

export type GoogleCalendarOAuthResult = 'success' | 'error';

type UseGoogleCalendarSyncOptions = {
  /** When false, skips status fetch and OAuth URL cleanup. Default true. */
  enabled?: boolean;
};

export function useGoogleCalendarSync(options?: UseGoogleCalendarSyncOptions) {
  const enabled = options?.enabled ?? true;
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthResult, setOauthResult] = useState<GoogleCalendarOAuthResult | null>(null);

  const refreshStatus = useCallback(async () => {
    const status = await googleCalendarService.getStatus();
    setConnected(status.connected);
    return status.connected;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    const url = new URL(window.location.href);
    let detectedOAuth: GoogleCalendarOAuthResult | null = null;
    if (url.searchParams.get('connected') === '1') {
      detectedOAuth = 'success';
    } else if (url.searchParams.get('error') === 'oauth_failed') {
      detectedOAuth = 'error';
    }
    if (url.searchParams.has('connected') || url.searchParams.has('error')) {
      url.searchParams.delete('connected');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
    if (detectedOAuth && active) {
      setOauthResult(detectedOAuth);
    }

    const load = async () => {
      setLoading(true);
      try {
        const status = await googleCalendarService.getStatus();
        if (active) {
          setConnected(status.connected);
        }
      } catch {
        if (active) {
          setConnected(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [enabled]);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const redirectUri = new URL(window.location.href);
      redirectUri.searchParams.delete('connected');
      redirectUri.searchParams.delete('error');
      const { url } = await googleCalendarService.getAuthUrl(redirectUri.toString());
      window.location.href = url;
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await googleCalendarService.disconnect();
      await refreshStatus();
    } finally {
      setBusy(false);
    }
  }, [refreshStatus]);

  const clearOAuthResult = useCallback(() => {
    setOauthResult(null);
  }, []);

  return {
    connected,
    loading,
    busy,
    oauthResult,
    connect,
    disconnect,
    refreshStatus,
    clearOAuthResult,
  };
}
