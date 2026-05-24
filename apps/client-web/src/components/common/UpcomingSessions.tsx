import { useMemo, useState } from 'react';
import { sessionsService } from '@/services/sessions.service';
import {
  SessionStatus,
  type Session,
  type SessionType,
} from '@grow-fitness/shared-types';
import SessionDetailsModal from './SessionDetailsModal';
import { SessionSpecialBadges } from './SessionSpecialBadges';
import { useApiQuery } from '@/hooks/useApiQuery';
import { CalendarDays, Clock, MapPin, Tag, User } from 'lucide-react';
import { addDays, addMinutes, endOfDay, format, startOfDay } from 'date-fns';
import { formatSessionType } from '@/lib/formatters';

type UpcomingSessionsProps = {
  kidId?: string;
  coachId?: string;
  /** Parent dashboard: enrolment profile for reschedule gating in session details. */
  parentKidSessionType?: SessionType;
  limit?: number;
};

export const UpcomingSessions = ({
  kidId,
  coachId,
  parentKidSessionType,
  limit = 3,
}: UpcomingSessionsProps) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    return {
      startDate: startOfDay(now).toISOString(),
      endDate: endOfDay(addDays(now, 90)).toISOString(),
    };
  }, []);

  const { data: sessions = [], isLoading } = useApiQuery<Session[]>(
    ['upcoming-sessions', kidId ?? '', coachId ?? '', startDate, endDate],
    async () => {
      const response = await sessionsService.getSessions(1, 50, {
        kidId,
        coachId,
        startDate,
        endDate,
        sortBy: 'dateTime',
        sortOrder: 'asc',
      });

      return response.data;
    },
    {
      enabled: Boolean(kidId || coachId),
      staleTime: 5 * 60 * 1000,
    }
  );

  // ✅ ensure correct ordering + limit
  const upcomingSessions = useMemo(() => {
    return [...sessions]
      .filter((s) => new Date(s.dateTime) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
      .slice(0, limit);
  }, [sessions, limit]);


  const getSessionAccent = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.CONFIRMED:
        return 'border-l-green-500';
      case SessionStatus.CANCELLED:
        return 'border-l-red-500';
      default:
        return 'border-l-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[78px] rounded-xl border border-[#23B685]/15 bg-[#23B685]/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!upcomingSessions.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#23B685]/25 bg-[#23B685]/5 px-6 text-center">
        <CalendarDays className="h-8 w-8 text-[#23B685]" />
        <p className="mt-3 text-sm font-medium text-[#243E36]">
          No upcoming sessions
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Your next sessions will appear here once they are scheduled.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {upcomingSessions.map((session) => (
          <li key={session.id}>
            <div
              onClick={() => setSelectedSession(session)}
              className={`cursor-pointer rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#23B685]/30 ${getSessionAccent(
                session.status
              )}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#CDEEE3] text-[#243E36]">
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {format(new Date(session.dateTime), 'MMM')}
                  </span>

                  <span className="text-xl font-bold leading-none">
                    {format(new Date(session.dateTime), 'dd')}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-semibold text-[#243E36]">
                      {session.title?.trim() || formatSessionType(session.type)}
                    </h3>
                    <SessionSpecialBadges session={session} />
                    <span className="rounded-full bg-[#CDEEE3] px-2 py-0.5 text-xs font-medium text-[#1B7F5D]">
                      • {session.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {format(new Date(session.dateTime), 'hh:mm a')} -{' '}
                        {format(
                          addMinutes(new Date(session.dateTime), session.duration),
                          'hh:mm a'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{session.coach?.coachProfile?.name || '-'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{session.location?.name || '-'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{formatSessionType(session.type)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession || undefined}
        onClose={() => setSelectedSession(null)}
        kidId={kidId}
        parentKidSessionType={parentKidSessionType}
        onReschedule={() => { }}
      />
    </div>
  );
};