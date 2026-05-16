import { useMemo, useState } from 'react';
import { addDays, endOfDay, startOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import type { PaginatedResponse, Session } from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Plus, List, CalendarDays } from 'lucide-react';
import { sessionsService } from '@/services/sessions.service';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useKid } from '@/contexts/kid/useKid';
import BookSessionModal from './BookSessionModal';
import { StatusBadge } from '@/components/common/StatusBadge';

type ScheduleView = 'list' | 'calendar';

const getSessionLabel = (session: Session): string => {
  switch (session.type) {
    case 'INDIVIDUAL':
      return 'Private Session';
    case 'GROUP':
      return 'Group Session';
    default:
      return 'Session';
  }
};

const LIST_VIEW_DAYS = 90;

export default function ScheduleTab() {
  const { selectedKid } = useKid();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<ScheduleView>('list');
  const [openBooking, setOpenBooking] = useState(false);
  const canRequestExtraSession = Boolean(
    selectedKid &&
    (selectedKid.sessionType === 'INDIVIDUAL' ||
      selectedKid.sessionType === 'GROUP' ||
      selectedKid.sessionType === 'BOTH')
  );

  const listRange = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(addDays(new Date(), LIST_VIEW_DAYS));
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const calendarInitialRange = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    const end = endOfWeek(new Date(), { weekStartsOn: 0 });
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(calendarInitialRange);

  const effectiveRange = view === 'list' ? listRange : dateRange;

  const { data: sessionsData, isLoading } = useApiQuery<PaginatedResponse<Session>>(
    ['sessions', selectedKid?.id ?? '', view, effectiveRange.start, effectiveRange.end],
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
        startDate: effectiveRange.start,
        endDate: effectiveRange.end,
      });
    },
    { enabled: Boolean(selectedKid?.id) }
  );

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData?.data]);

  const events = useMemo(() => {
    return sessions.map(session =>
      sessionToCalendarEvent(session, {
        formatTitle: s => s.title?.trim() || getSessionLabel(s),
      })
    );
  }, [sessions]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }, [sessions]);

  return (
    <>
      <Card className="border-[#23B685]/20 shadow-sm">
        <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            Schedule
          </CardTitle>
          {canRequestExtraSession && (
            <Button size="sm" onClick={() => setOpenBooking(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Book Extra Session
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={v => setView(v as ScheduleView)}>
            <TabsList className="mb-4 grid w-full grid-cols-2 sm:max-w-[240px]">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading sessions…
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                  No upcoming sessions in the next {LIST_VIEW_DAYS} days.
                </div>
              ) : (
                <div className="w-full overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border bg-white">
                      {sortedSessions.map((session) => (
                        <tr
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          {/* Title */}
                          <td className="px-4 py-3 font-medium text-foreground">
                            {session.title?.trim() || getSessionLabel(session)}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(session.dateTime), 'dd MMM yyyy')}
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {session.type}
                          </td>

                          {/* Time */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(session.dateTime), 'hh:mm a')} - {format(
                              new Date(new Date(session.dateTime).getTime() + session.duration * 60000),
                              'hh:mm a'
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {session.location?.name ?? '-'}
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {session.duration} min
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge status={session.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <SessionsCalendar
                events={events}
                onSessionClick={setSelectedSession}
                onDatesSet={(start, end) => setDateRange({ start, end })}
                loading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession ?? undefined}
        onClose={() => setSelectedSession(null)}
        kidId={selectedKid?.id}
        onReschedule={() => { }}
      />

      {canRequestExtraSession && (
        <BookSessionModal open={openBooking} onClose={() => setOpenBooking(false)} />
      )}
    </>
  );
}
