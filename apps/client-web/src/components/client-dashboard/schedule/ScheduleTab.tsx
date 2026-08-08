import { useMemo, useState } from 'react';
import { addDays, endOfDay, startOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import {
  SessionType,
  type PaginatedResponse,
  type Session,
} from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
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
import { Calendar as CalendarIcon, Plus, Eye, Maximize2, X } from 'lucide-react';
import { sessionsService } from '@/services/sessions.service';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useKid } from '@/contexts/kid/useKid';
import { GoogleCalendarSyncButton } from '@/components/common/GoogleCalendarSyncButton';
import { isGmailAccount } from '@/lib/google-calendar';
import type { GoogleCalendarOAuthResult } from '@/hooks/useGoogleCalendarSync';
import BookSessionModal from './BookSessionModal';
import { usePagination } from '@/hooks/usePagination';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatSessionType } from '@/lib/formatters';
import { SessionSpecialBadges } from '@/components/common/SessionSpecialBadges';
import type { ColumnDef } from '@tanstack/react-table';

type ScheduleView = 'calendar' | 'list';

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
  const { page, pageSize, setPage, setPageSize } = usePagination();

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
  const [view, setView] = useState<ScheduleView>('calendar');
  const [openBooking, setOpenBooking] = useState(false);
  const [upcomingScope, setUpcomingScope] = useState<UpcomingSessionsScope>('ninety_days');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      page.toString(),
      pageSize.toString(),
    ],
    () => {
      if (!selectedKid?.id) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: pageSize,
          totalPages: 0,
        });
      }

      if (view === 'list' && upcomingScope === 'all_upcoming') {
        return fetchAllPagesUpcomingForKid(selectedKid.id);
      }

      return sessionsService.getSessions(page, pageSize, {
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

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex max-w-[220px] flex-wrap items-center gap-2 sm:max-w-none">
            <span className="min-w-0">
              {session.title?.trim() || getSessionLabel(session)}
            </span>
            <SessionSpecialBadges session={session} className="shrink-0" />
          </div>
        );
      },
    },
    {
      id: 'date',
      accessorKey: 'dateTime',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.dateTime), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatSessionType(row.original.type),
    },
    {
      id: 'time',
      accessorKey: 'dateTime',
      header: 'Time',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <>
            {format(new Date(session.dateTime), 'hh:mm a')} -{' '}
            {format(
              new Date(
                new Date(session.dateTime).getTime() + session.duration * 60000
              ),
              'hh:mm a'
            )}
          </>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location?.name ?? '-',
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => `${row.original.duration} min`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedSession(session)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Card className="border-2 border-[var(--gf-green-deep)] shadow-[4px_4px_0_0_var(--gf-green-deep)] bg-[var(--gf-paper)] rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between bg-[var(--gf-green-50)]/40 border-b border-[var(--line)]">
          <CardTitle className="text-[var(--gf-green-deep)] text-lg sm:text-xl flex items-center font-extrabold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            <CalendarIcon className="mr-2 h-5 w-5 text-[var(--gf-green)]" />
            Schedule
          </CardTitle>
          {canRequestExtraSession && (
            <Button size="sm" onClick={() => setOpenBooking(true)} className="bg-[var(--gf-green)] text-sm text-white hover:bg-[var(--gf-green)]/90 font-bold border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--gf-green-deep)] active:translate-y-[1px] active:shadow-[0_0_0_0_var(--gf-green-deep)] rounded-xl transition-all duration-120 h-9 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Book Extra Session
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={view} onValueChange={v => setView(v as ScheduleView)}>
            <TabsList className="mb-4 bg-[var(--gf-paper)] rounded-xl p-1 h-auto grid w-full grid-cols-2 sm:max-w-[400px] gap-2 p-1">
              <TabsTrigger value="calendar" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg py-1.5 transition-all border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                Calendar
              </TabsTrigger>
               <TabsTrigger value="list" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg py-1.5 transition-all border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                List
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
              <DataTable
                columns={columns}
                data={sessions}
                isLoading={isLoading}
                emptyMessage="No sessions found"
              />
              {sessionsData && sessionsData.totalPages > 1 && (
                <Pagination
                  data={sessionsData}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                {showGoogleCalendarSync && (
                  <GoogleCalendarSyncButton
                    enabled
                    onOAuthResult={handleGoogleCalendarOAuthResult}
                  />
                )}
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  variant="outline"
                  className="ml-auto border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/30 font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--gf-green-deep)] transition-all rounded-lg text-xs"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
              </div>
              <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-hidden' : ''}>
                {isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(false)}
                    variant="outline"
                    className="absolute bottom-4 left-4 z-10 border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/30 font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--gf-green-deep)] transition-all rounded-lg text-xs"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Exit
                  </Button>
                )}
                <SessionsCalendar
                  events={events}
                  onSessionClick={setSelectedSession}
                  onDatesSet={(start, end) => setDateRange({ start, end })}
                  loading={isLoading}
                  height={isFullscreen ? 'calc(100vh - 100px)' : undefined}
                />
              </div>
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

      {openBooking && (
        <BookSessionModal open={openBooking} onClose={() => setOpenBooking(false)} />
      )}
    </div>
  );
}
