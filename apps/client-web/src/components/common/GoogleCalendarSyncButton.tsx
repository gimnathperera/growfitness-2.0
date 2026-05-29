import { useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGoogleCalendarSync,
  type GoogleCalendarOAuthResult,
} from '@/hooks/useGoogleCalendarSync';
import { cn } from '@/lib/utils';

type GoogleCalendarSyncButtonProps = {
  /** When false, renders nothing. Use with isGmailAccount(email). */
  enabled?: boolean;
  className?: string;
  onOAuthResult?: (result: GoogleCalendarOAuthResult) => void;
};

/** Admin-style toggle: Sync with Google Calendar / Disconnect Google Calendar. */
export function GoogleCalendarSyncButton({
  enabled = true,
  className,
  onOAuthResult,
}: GoogleCalendarSyncButtonProps) {
  const { connected, loading, busy, oauthResult, connect, disconnect, clearOAuthResult } =
    useGoogleCalendarSync({ enabled });

  useEffect(() => {
    if (!oauthResult || !onOAuthResult) {
      return;
    }
    onOAuthResult(oauthResult);
    clearOAuthResult();
  }, [oauthResult, onOAuthResult, clearOAuthResult]);

  if (!enabled) {
    return null;
  }

  const handleClick = () => {
    if (connected) {
      void disconnect();
    } else {
      void connect();
    }
  };

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <Button
        type="button"
        variant={connected ? 'outline' : 'default'}
        onClick={handleClick}
        disabled={loading || busy}
        className="flex items-center gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        {connected ? 'Disconnect Google Calendar' : 'Sync with Google Calendar'}
      </Button>
    </div>
  );
}
