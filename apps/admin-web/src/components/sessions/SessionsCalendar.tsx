import { useState } from 'react';
import {
  SessionsCalendar as SharedSessionsCalendar,
  sessionToCalendarEvent,
} from '@grow-fitness/schedule-calendar';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
import { useApiQuery, useApiMutation } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { formatSessionType } from '@/lib/formatters';
import { useToast } from '@/hooks/useToast';

interface SessionsCalendarProps {
  onSessionClick: (session: Session) => void;
  coachId?: string;
  locationId?: string;
  status?: SessionStatus | '';
}

export function SessionsCalendar({
  onSessionClick,
  coachId,
  locationId,
  status,
}: SessionsCalendarProps) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const { data, isLoading, refetch } = useApiQuery(
    [
      'sessions',
      'calendar',
      coachId || 'all',
      locationId || 'all',
      status || 'all',
      dateRange?.start || 'all',
      dateRange?.end || 'all',
    ],
    () => {
      if (!dateRange) return Promise.resolve({ data: [], total: 0 });
      const start = new Date(dateRange.start);
      start.setDate(start.getDate() - 1);
      const end = new Date(dateRange.end);
      end.setDate(end.getDate() + 1);
      return sessionsService.getSessions(1, 100, {
        coachId: coachId || undefined,
        locationId: locationId || undefined,
        status: (status as SessionStatus) || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    },
    {
      enabled: !!dateRange,
      refetchOnWindowFocus: false,
    }
  );

  const updateSessionMutation = useApiMutation(
    ({ id, data }: { id: string; data: { dateTime?: string; duration?: number } }) =>
      sessionsService.updateSession(id, data),
    {
      onSuccess: () => {
        toast.success('Session updated successfully');
        refetch();
      },
      onError: (error) => {
        toast.error('Failed to update session', error.message);
        refetch();
      },
    }
  );

  const events = (data?.data || []).map((session) =>
    sessionToCalendarEvent(session, {
      formatTitle: (s) => {
        if (s.title) return s.title;
        let coachName = 'Session';
        if (s.coachId && typeof s.coachId === 'object') {
          const c = s.coachId as Record<string, unknown>;
          coachName =
            (c.coachProfile as { name?: string })?.name ||
            (c.email as string) ||
            (c.firstName as string) ||
            'Coach';
        }
        return `${formatSessionType(s.type)} - ${coachName}`;
      },
    })
  );

  const handleEventDrop = (sessionId: string, newStart: Date, durationMinutes: number) => {
    updateSessionMutation.mutate({
      id: sessionId,
      data: {
        dateTime: newStart.toISOString(),
        duration: durationMinutes,
      },
    });
  };

  const handleEventResize = (sessionId: string, durationMinutes: number) => {
    updateSessionMutation.mutate({
      id: sessionId,
      data: { duration: durationMinutes },
    });
  };

  return (
    <SharedSessionsCalendar
      events={events}
      onSessionClick={onSessionClick}
      onDatesSet={(start, end) => setDateRange({ start, end })}
      loading={isLoading}
      editable={true}
      onEventDrop={handleEventDrop}
      onEventResize={handleEventResize}
    />
  );
}
