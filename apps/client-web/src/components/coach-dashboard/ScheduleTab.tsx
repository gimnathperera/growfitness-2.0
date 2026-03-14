import { useState, useMemo } from 'react';
import { sessionsService } from '@/services/sessions.service';
import type { Session } from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/useAuth';

const getSessionLabel = (session: Session): string => {
  switch (session.type) {
    case 'INDIVIDUAL':
      return 'Individual Session';
    case 'GROUP':
      return 'Group Session';
    default:
      return 'Session';
  }
};

export default function ScheduleTab() {
  const { user } = useAuth();
  const coachId = user?.id;
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const { data: sessionsData, isLoading } = useApiQuery(
    ['sessions', 'calendar', coachId ?? '', dateRange?.start ?? '', dateRange?.end ?? ''],
    () => {
      if (!coachId) throw new Error('Coach ID is required to fetch sessions');
      return sessionsService.getSessions(1, 100, {
        coachId,
        startDate: dateRange!.start,
        endDate: dateRange!.end,
      });
    },
    { enabled: Boolean(coachId && dateRange) }
  );

  const events = useMemo(() => {
    const sessions = sessionsData?.data ?? [];
    return sessions.map((session) =>
      sessionToCalendarEvent(session, { formatTitle: getSessionLabel })
    );
  }, [sessionsData?.data]);

  return (
    <>
      <Card className="border-[#23B685]/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsCalendar
            events={events}
            onSessionClick={setSelectedSession}
            onDatesSet={(start, end) => setDateRange({ start, end })}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession ?? undefined}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
}
