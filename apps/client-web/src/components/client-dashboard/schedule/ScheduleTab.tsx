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
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [openBooking, setOpenBooking] = useState(false);
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
   * Get kid's coach ID
   * ------------------------------------------------------------------ */
  const coachId = kid.coach?.id || kid.coachId;

  /* ------------------------------------------------------------------
   * Fetch sessions for the coach
   * ------------------------------------------------------------------ */
  const { data: sessionsData } = useApiQuery(
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

  const sessions: Session[] = sessionsData?.data || [];

  /* ------------------------------------------------------------------
   * Map calendar events
   * ------------------------------------------------------------------ */
  const events: CalendarEvent[] = useMemo(
    () =>
      sessions.map(s => ({
        _id: s._id,
        title: s.type || s.name || 'Session',
        date: new Date(s.startsAt),
        session: s,
      })),
    [sessions]
  );

  /* ------------------------------------------------------------------
   * Calendar grid
   * ------------------------------------------------------------------ */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push(new Date(year, month, i));

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
              onClick={() =>
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button size="sm" onClick={() => setOpenBooking(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Extra Session
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-[1px] bg-muted rounded-lg overflow-hidden text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 font-medium text-center bg-muted/50">
                {d}
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
        onClose={() => setSelectedSession(null)}
      />

      <BookSessionModal
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        onConfirm={data => console.log('Booked:', data)}
      />
    </>
  );
}
