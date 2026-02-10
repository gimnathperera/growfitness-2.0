import { useEffect, useState } from 'react';
import { sessionsService } from '@/services/sessions.service';
import { SessionStatus, type Session } from '@grow-fitness/shared-types';
import SessionDetailsModal from './SessionDetailsModal';

type UpcomingSessionsProps = {
  kidId?: string;
  coachId?: string;
};

export const UpcomingSessions = ({ kidId, coachId }: UpcomingSessionsProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        // Get next 3 sessions
        const response = await sessionsService.getSessions(1, 3, {
          kidId,
          coachId,
        });

        setSessions(response.data); // adjust if your API returns PaginatedResponse
      } catch (error) {
        console.error('Failed to fetch upcoming sessions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, [kidId, coachId]);

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.CONFIRMED:
        return <span className="text-green-600 font-semibold">Confirmed</span>;
      case SessionStatus.CANCELLED:
        return <span className="text-red-600 font-semibold">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) return <p>Loading upcoming sessions...</p>;

  if (!sessions.length) {
    return <p>No upcoming sessions.</p>;
  }

  return (
    <div>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id}>
            <div
              onClick={() => setSelectedSession(session)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                session.status === SessionStatus.CONFIRMED
                  ? 'bg-[#23B685]/5 hover:bg-[#23B685]/10'
                  : 'border border-[#23B685]/20 hover:bg-[#23B685]/10'
              }`}
            >
              <div>
                <h3 className="font-semibold text-[#243E36]">{session.type}</h3>
                <p className="text-sm text-primary">
                  {new Date(session.dateTime).toLocaleString()}
                </p>
              </div>
              {getStatusBadge(session.status)}
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
