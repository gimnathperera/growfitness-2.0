import { useState, useMemo } from 'react';
import { addDays, endOfDay, startOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { sessionsService } from '@/services/sessions.service';
import type { PaginatedResponse, Session } from '@grow-fitness/shared-types';
import { SessionsCalendar, sessionToCalendarEvent } from '@grow-fitness/schedule-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Maximize2, X } from 'lucide-react';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { GoogleCalendarSyncButton } from '@/components/common/GoogleCalendarSyncButton';
import { isGmailAccount } from '@/lib/google-calendar';
import type { GoogleCalendarOAuthResult } from '@/hooks/useGoogleCalendarSync';
import { SessionsTable } from '@/components/schedule/SessionsTable';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/common/Pagination';

type ScheduleView =  'calendar' | 'list';

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
  const coachId = user?.id;
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
    ['sessions', coachId ?? '', view, effectiveRange.start, effectiveRange.end, page.toString(), pageSize.toString()],
    () => {
      if (!coachId) {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          limit: pageSize,
          totalPages: 0,
        });
      }
      return sessionsService.getSessions(page, pageSize, {
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

  return (
    <div>
      <Card className="border-2 border-[var(--gf-green-deep)] shadow-[4px_4px_0_0_var(--gf-green-deep)] bg-[var(--gf-paper)] rounded-2xl overflow-hidden">
        <CardHeader className="bg-[var(--gf-green-50)]/40 border-b border-[var(--line)]">
          <CardTitle className="text-[var(--gf-green-deep)] text-lg sm:text-xl flex items-center font-extrabold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            <CalendarIcon className="mr-2 h-5 w-5 text-[var(--gf-green-deep)]" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={view} onValueChange={(v) => setView(v as ScheduleView)}>
            <TabsList className="mb-4 bg-[var(--gf-paper)] rounded-xl p-1 h-auto grid w-full grid-cols-2 sm:max-w-[400px] gap-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg py-1.5 transition-all border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg py-1.5 transition-all border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              <SessionsTable
                data={sessions}
                isLoading={isLoading}
                onSessionClick={setSelectedSession}
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
      />
    </div>
  );
}
