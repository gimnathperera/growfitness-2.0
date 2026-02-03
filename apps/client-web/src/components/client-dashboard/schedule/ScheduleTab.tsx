import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

import { sessionsService } from '@/services/sessions.service';
import type { Session, Kid } from '@grow-fitness/shared-types';
import SessionDetailsModal from '@/components/common/SessionDetailsModal';
import BookSessionModal from './BookSessionModal';
import { useApiQuery } from '@/hooks/useApiQuery';

type CalendarEvent = {
  _id: string;
  title: string;
  date: Date;
  session: Session;
};

type Props = {
  kid: Kid;
};

export default function ScheduleTab({ kid }: Props) {
  /* ------------------------------------------------------------------
   * Debug: incoming props
   * ------------------------------------------------------------------ */
  console.log('[ScheduleTab] kid prop:', kid);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  /* ------------------------------------------------------------------
   * Month range
   * ------------------------------------------------------------------ */
  const [startDate, endDate] = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    const range = [
      new Date(y, m, 1).toISOString(),
      new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString(),
    ] as const;

    console.log('[ScheduleTab] date range:', range);
    return range;
  }, [currentDate]);

  /* ------------------------------------------------------------------
   * Get kid's coach ID
   * ------------------------------------------------------------------ */
  const coachId = kid.coach?.id || kid.coachId;
  console.log('[ScheduleTab] coachId:', coachId);

  /* ------------------------------------------------------------------
   * Fetch sessions for the coach
   * ------------------------------------------------------------------ */
  const {
    data: sessionsData,
    isLoading,
    isError,
    error,
  } = useApiQuery(
    ['sessions', coachId, startDate, endDate],
    () =>
      sessionsService.getSessions(1, 50, {
        coachId,
        startDate,
        endDate,
      }),
    {
      enabled: !!coachId,
    }
  );

  console.log('[ScheduleTab] query state:', {
    isLoading,
    isError,
    error,
    sessionsData,
  });

  const sessions: Session[] = sessionsData?.data || [];
  console.log('[ScheduleTab] sessions:', sessions);

  /* ------------------------------------------------------------------
   * Map calendar events
   * ------------------------------------------------------------------ */
  const events: CalendarEvent[] = useMemo(() => {
    const mapped = sessions.map(s => ({
      _id: s._id,
      title: s.type || s.name || 'Session',
      date: new Date(s.startsAt),
      session: s,
    }));

    console.log('[ScheduleTab] calendar events:', mapped);
    return mapped;
  }, [sessions]);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-base font-semibold">
            <CalendarIcon className="mr-2 h-5 w-5 text-[#23B685]" />
            {monthLabel}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('[ScheduleTab] prev month');
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('[ScheduleTab] go to today');
                setCurrentDate(new Date());
              }}
            >
              Today
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('[ScheduleTab] next month');
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={() => {
                console.log('[ScheduleTab] open booking modal');
                setOpenBooking(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Extra Session
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-[1px] bg-muted rounded-lg overflow-hidden text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div
                key={d}
                className="p-2 font-medium text-center bg-muted/50"
              >
                {d}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayEvents = events.filter(
                e => day && e.date.toDateString() === day.toDateString()
              );

              if (day && dayEvents.length > 0) {
                console.log(
                  '[ScheduleTab] day events:',
                  day.toDateString(),
                  dayEvents
                );
              }

              return (
                <div key={idx} className="min-h-[100px] p-2 bg-white">
                  <div className="text-xs text-muted-foreground mb-1">
                    {day?.getDate()}
                  </div>

                  {dayEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={() => {
                        console.log(
                          '[ScheduleTab] selected session:',
                          event.session
                        );
                        setSelectedSession(event.session);
                      }}
                      className="mb-1 cursor-pointer rounded bg-primary/15 p-1 text-primary truncate"
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
        open={!!selectedSession}
        session={selectedSession}
        onClose={() => {
          console.log('[ScheduleTab] close session modal');
          setSelectedSession(null);
        }}
      />

      <BookSessionModal
        open={openBooking}
        onClose={() => {
          console.log('[ScheduleTab] close booking modal');
          setOpenBooking(false);
        }}
        onConfirm={data =>
          console.log('[ScheduleTab] booked session payload:', data)
        }
      />
    </>
  );
}
