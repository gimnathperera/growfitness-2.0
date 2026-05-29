import { useMemo, useState } from 'react';
import { addDays, endOfDay, startOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import {
  SessionType,
  type PaginatedResponse,
  type Session,
} from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { formatSessionType } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Plus, List, CalendarDays } from 'lucide-react';
import { sessionsService } from '@/services/sessions.service';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { SessionSpecialBadges } from '@/components/common/SessionSpecialBadges';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useKid } from '@/contexts/kid/useKid';
import { GoogleCalendarSyncButton } from '@/components/common/GoogleCalendarSyncButton';
import { isGmailAccount } from '@/lib/google-calendar';
import type { GoogleCalendarOAuthResult } from '@/hooks/useGoogleCalendarSync';
import BookSessionModal from './BookSessionModal';
import { StatusBadge } from '@/components/common/StatusBadge';

type ScheduleView = 'list' | 'calendar';

type UpcomingSessionsScope = 'ninety_days' | 'all_upcoming';

/** Max pages × 100 when loading “all upcoming” (avoid unbounded loops). */
const ALL_UPCOMING_MAX_PAGES = 50;

async function fetchAllPagesUpcomingForKid(kidId: string): Promise<PaginatedResponse<Session>> {
  const limit = 100;
  let page = 1;
  const all: Session[] = [];
  let total = 0;
  const startDate = startOfDay(new Date()).toISOString();

  while (page <= ALL_UPCOMING_MAX_PAGES) {
    const res = await sessionsService.getSessions(page, limit, {
      kidId,
      startDate,
      sortBy: 'dateTime',
      sortOrder: 'asc',
    });
    total = res.total;
    all.push(...res.data);
    if (page >= res.totalPages) break;
    page += 1;
  }

  return {
    data: all,
    total,
    page: 1,
    limit: all.length || limit,
    totalPages: 1,
  };
}

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
  const { toast } = useToast();
  const { selectedKid } = useKid();
  const showGoogleCalendarSync = isGmailAccount(user?.email);

  const handleGoogleCalendarOAuthResult = (result: GoogleCalendarOAuthResult) => {
    if (result === 'success') {
      toast({
        variant: 'success',
        title: 'Google Calendar connected',
        description: 'Your sessions will sync to Google Calendar automatically.',
      });
    } else {
      toast({
        title: 'Could not connect Google Calendar',
        description: 'Please try again or use a Google account that granted calendar access.',
        variant: 'destructive',
      });
    }
  };
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<ScheduleView>('list');
  const [openBooking, setOpenBooking] = useState(false);
  const [upcomingScope, setUpcomingScope] = useState<UpcomingSessionsScope>('ninety_days');

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
    [
      'sessions',
      selectedKid?.id ?? '',
      view,
      upcomingScope,
      effectiveRange.start,
      effectiveRange.end,
    ],
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

      if (view === 'list' && upcomingScope === 'all_upcoming') {
        return fetchAllPagesUpcomingForKid(selectedKid.id);
      }

      return sessionsService.getSessions(1, 100, {
        kidId: selectedKid.id,
        startDate: effectiveRange.start,
        endDate: effectiveRange.end,
        sortBy: 'dateTime',
        sortOrder: 'asc',
      });
    },
    { enabled: Boolean(selectedKid?.id) }
  );

  const sessions = useMemo(() => sessionsData?.data ?? [], [sessionsData?.data]);

  /** Hide "Book Extra Session" only when every session in range is a group class (no private rows). */
  const scheduleIsGroupOnly = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.every(s => s.type === SessionType.GROUP);
  }, [sessions]);

  const canRequestExtraSession = useMemo(() => {
    if (!selectedKid) return false;
    if (scheduleIsGroupOnly === true) return false;
    if (scheduleIsGroupOnly === false) return true;
    // No sessions in range: fall back to enrolment profile
    return (
      selectedKid.sessionType === 'INDIVIDUAL' ||
      selectedKid.sessionType === 'BOTH'
    );
  }, [selectedKid, scheduleIsGroupOnly]);

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

            <div
              className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              title={
                view === 'calendar'
                  ? 'List filter applies to List view only. Browse dates in Calendar to load sessions for that range.'
                  : undefined
              }
            >
              <span className="text-xs font-medium text-muted-foreground">Upcoming sessions</span>
              <Select
                value={upcomingScope}
                onValueChange={v => setUpcomingScope(v as UpcomingSessionsScope)}
                disabled={view === 'calendar'}
              >
                <SelectTrigger className="h-9 w-full sm:w-[min(100%,260px)]" aria-label="Filter upcoming sessions range">
                  <SelectValue placeholder="Choose range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninety_days">Next 90 days</SelectItem>
                  <SelectItem value="all_upcoming">All upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading sessions…
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 py-12 text-center text-sm text-muted-foreground">
                  {upcomingScope === 'all_upcoming'
                    ? 'No upcoming sessions found for this child.'
                    : `No upcoming sessions in the next ${LIST_VIEW_DAYS} days.`}
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
                      {sortedSessions.map(session => (
                        <tr
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="flex max-w-[220px] flex-wrap items-center gap-2 sm:max-w-none">
                              <span className="min-w-0">
                                {session.title?.trim() || getSessionLabel(session)}
                              </span>
                              <SessionSpecialBadges session={session} className="shrink-0" />
                            </div>
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(session.dateTime), 'dd MMM yyyy')}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {formatSessionType(session.type)}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(session.dateTime), 'hh:mm a')} -{' '}
                            {format(
                              new Date(
                                new Date(session.dateTime).getTime() + session.duration * 60000
                              ),
                              'hh:mm a'
                            )}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {session.location?.name ?? '-'}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">{session.duration} min</td>

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

            <TabsContent value="calendar" className="mt-0 space-y-4">
              {showGoogleCalendarSync && (
                <GoogleCalendarSyncButton
                  enabled
                  onOAuthResult={handleGoogleCalendarOAuthResult}
                />
              )}
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
        parentKidSessionType={selectedKid?.sessionType}
        onReschedule={() => { }}
      />

      {canRequestExtraSession && (
        <BookSessionModal open={openBooking} onClose={() => setOpenBooking(false)} />
      )}
    </>
  );
}
