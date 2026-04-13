import { useState } from 'react';
import { sessionsService } from '@/services/sessions.service';
import { SessionStatus, type Session } from '@grow-fitness/shared-types';
import SessionDetailsModal from './SessionDetailsModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { CalendarDays } from 'lucide-react';

type UpcomingSessionsProps = {
  kidId?: string;
  coachId?: string;
};

export const UpcomingSessions = ({ kidId, coachId }: UpcomingSessionsProps) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading } = useApiQuery<Session[]>(
    ['upcoming-sessions', kidId ?? '', coachId ?? ''],
    async () => {
      const response = await sessionsService.getSessions(1, 5, {
        kidId,
        coachId,
      });
      return response.data;
    },
    {
      enabled: Boolean(kidId || coachId),
      staleTime: 5 * 60 * 1000,
    }
  );

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.CONFIRMED:
        return (
          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            Confirmed
          </span>
        );
      case SessionStatus.CANCELLED:
        return (
          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Scheduled
          </span>
        );
    }
  };

  const getSessionAccent = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.CONFIRMED:
        return 'border-l-green-500';
      case SessionStatus.CANCELLED:
        return 'border-l-red-500';
      default:
        return 'border-l-amber-500';
    }
  };

  const formatDate = (dateTime: string | Date) =>
    new Date(dateTime).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (dateTime: string | Date) =>
    new Date(dateTime).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

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

  if (!sessions.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#23B685]/25 bg-[#23B685]/5 px-6 text-center">
        <CalendarDays className="h-8 w-8 text-[#23B685]" />
        <p className="mt-3 text-sm font-medium text-[#243E36]">No upcoming sessions</p>
        <p className="mt-1 text-sm text-gray-500">Your next sessions will appear here once they are scheduled.</p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li key={session.id}>
            <div
              onClick={() => setSelectedSession(session)}
              className={`cursor-pointer rounded-xl border border-[#23B685]/20 border-l-4 bg-white px-4 py-3 transition-colors hover:bg-[#23B685]/5 ${getSessionAccent(session.status)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#243E36]">{session.type}</h3>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(session.dateTime)}</p>
                </div>
                <p className="text-sm font-medium text-[#243E36]">
                  {formatTime(session.dateTime)}
                </p>
              </div>
              <div className="mt-2">{getStatusBadge(session.status)}</div>
            </div>
          </li>
        ))}
      </ul>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession || undefined}
        onClose={() => setSelectedSession(null)}
        kidId={kidId}
        onReschedule={() => {}}
      />
    </div>
  );
};
