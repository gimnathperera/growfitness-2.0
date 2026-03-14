import { useState, useMemo } from 'react';
import type { PaginatedResponse, Session } from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { sessionsService } from '@/services/sessions.service';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useKid } from '@/contexts/kid/useKid';
import BookSessionModal from './BookSessionModal';

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
  const { selectedKid } = useKid();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [openBooking, setOpenBooking] = useState(false);

  const { data: sessionsData, isLoading } = useApiQuery<PaginatedResponse<Session>>(
    ['sessions', selectedKid?.id ?? '', dateRange?.start ?? '', dateRange?.end ?? ''],
    () => {
      if (!selectedKid?.id) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      }
      return sessionsService.getSessions(1, 100, {
        kidId: selectedKid.id,
        startDate: dateRange!.start,
        endDate: dateRange!.end,
      });
    },
    { enabled: Boolean(selectedKid?.id && dateRange) }
  );

  const events = useMemo(() => {
    const sessions = sessionsData?.data ?? [];
    return sessions.map((session) =>
      sessionToCalendarEvent(session, { formatTitle: getSessionLabel })
    );
  }, [sessionsData]);

  return (
    <>
      <Card className="border-[#23B685]/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            Schedule
          </CardTitle>
          {selectedKid?.sessionType === 'INDIVIDUAL' && (
            <Button size="sm" onClick={() => setOpenBooking(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Extra Session
            </Button>
          )}
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
        kidId={selectedKid?.id}
        onReschedule={() => {}}
      />

      {selectedKid?.sessionType === 'INDIVIDUAL' && (
        <BookSessionModal open={openBooking} onClose={() => setOpenBooking(false)} />
      )}
    </>
  );
}
