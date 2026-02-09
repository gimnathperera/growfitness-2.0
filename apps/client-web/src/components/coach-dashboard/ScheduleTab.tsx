import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { sessionsService } from '@/services/sessions.service';
import type { Session } from '@grow-fitness/shared-types';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/contexts/useAuth';

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function ScheduleTab() {
  const { user } = useAuth();
  const coachId = user?.id;

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  /* ------------------------------------------------------------------
   * Month range
   * ------------------------------------------------------------------ */

  const [startDate, endDate] = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    return [
      new Date(y, m, 1).toISOString(),
      new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString(),
    ] as const;
  }, [currentDate]);

  /* ------------------------------------------------------------------
   * Fetch sessions (coach-based)
   * ------------------------------------------------------------------ */

  const queryKey = [
    'sessions',
    coachId || '',
    startDate || '',
    endDate || '',
  ].filter(Boolean) as string[];
  const { data: sessionsData } = useApiQuery(
    queryKey,
    () => {
      if (!coachId) {
        throw new Error('Coach ID is required to fetch sessions');
    }
    return sessionsService.getSessions(1, 50, {
      coachId,
      startDate,
      endDate,
    });
  },
  {
    enabled: Boolean(coachId && startDate),
  }
);

  /* ------------------------------------------------------------------
   * Map calendar events
   * ------------------------------------------------------------------ */

  const events = useMemo(() => {
    const sessions: Session[] = sessionsData?.data ?? [];

    return sessions.map(session => ({
      _id: session.id,
      title: getSessionLabel(session),
      date: new Date(session.dateTime),
      session,
    }));
  }, [sessionsData?.data]);

  /* ------------------------------------------------------------------
   * Calendar grid
   * ------------------------------------------------------------------ */

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  const monthLabel = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <>
      <Card className="border-[#23B685]/20 shadow-sm">
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            {monthLabel}
          </CardTitle>

          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-[1px] bg-muted rounded-lg overflow-hidden text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-2 text-center font-medium bg-muted/50"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayEvents = events.filter(
                e => day && e.date.toDateString() === day.toDateString()
              );

              return (
                <div key={idx} className="min-h-[100px] p-2 bg-white">
                  <div className="text-xs text-muted-foreground mb-1">
                    {day?.getDate()}
                  </div>

                  {dayEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedSession(event.session)}
                      className="cursor-pointer mb-1 rounded bg-primary/15 p-1 text-primary truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession || undefined}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
}
