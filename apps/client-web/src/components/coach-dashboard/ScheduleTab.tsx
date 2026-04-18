import { useState, useMemo } from 'react';
import { addDays, endOfDay, startOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { sessionsService } from '@/services/sessions.service';
import type { PaginatedResponse, Session } from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, List, CalendarDays } from 'lucide-react';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/useAuth';
import { formatDateTime } from '@/lib/formatters';

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
  const { user } = useAuth();
  const coachId = user?.id;
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<ScheduleView>('list');

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
    ['sessions', coachId ?? '', view, effectiveRange.start, effectiveRange.end],
    () => {
      if (!coachId) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      }
      return sessionsService.getSessions(1, 100, {
        coachId,
        startDate: effectiveRange.start,
        endDate: effectiveRange.end,
      });
    },
    { enabled: Boolean(coachId) }
  );

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData?.data]);

  const events = useMemo(() => {
    return sessions.map((session) =>
      sessionToCalendarEvent(session, {
        formatTitle: (s) => s.title?.trim() || getSessionLabel(s),
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
        <CardHeader>
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={(v) => setView(v as ScheduleView)}>
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
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Loading sessions…
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 py-12 text-center text-muted-foreground text-sm">
                  No upcoming sessions in the next {LIST_VIEW_DAYS} days.
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {sortedSessions.map((session) => (
                    <li key={session.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSession(session)}
                        className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none sm:flex-row sm:items-center sm:gap-4"
                      >
                        <span className="text-xs text-muted-foreground sm:min-w-[140px] sm:text-sm">
                          {formatDateTime(session.dateTime)}
                        </span>
                        <span className="w-full font-medium text-foreground sm:flex-1">
                          {session.title?.trim() || getSessionLabel(session)}
                        </span>
                        <span className="text-xs text-muted-foreground sm:ml-auto">
                          {session.duration} min
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
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
      />
    </>
  );
}
