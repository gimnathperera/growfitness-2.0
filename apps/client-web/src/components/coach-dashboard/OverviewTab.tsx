import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import {
  type Session,
  SessionStatus,
  UserRole,
} from "@grow-fitness/shared-types";
import SessionDetailsModal from "../common/SessionDetailsModal";
import { StatsGrid } from "../common/StatGrid";
import type { DashboardStats } from "@/types/dashboard";
import { useAuth } from "@/contexts/useAuth";

type Coach = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export function OverviewTab() {
  const { user } = useAuth();
  const coachId = user?.id;

  const [coach, setCoach] = useState<Coach | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Replace with real API call later
  useEffect(() => {
    if (!coachId) return;

    const fetchCoach = async () => {
      try {
        // mock response
        const data: Coach = {
          id: coachId,
          name: "John Coach",
          email: "john.coach@email.com",
          createdAt: new Date().toISOString(),
        };

        setCoach(data);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [coachId]);

  // Temporary mock sessions & stats (replace later)
  const sessions: Session[] = [];

  const stats: DashboardStats = {
    totalChildren: 12,
    todaySessions: 3,
    upcomingSessions: 5,
    weeklyProgress: 80,
    avgProgress: 78,
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.CONFIRMED:
        return <Badge className="bg-[#23B685] text-white">Confirmed</Badge>;
      case SessionStatus.SCHEDULED:
        return <Badge variant="outline">Scheduled</Badge>;
      case SessionStatus.COMPLETED:
        return <Badge variant="secondary">Completed</Badge>;
      case SessionStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const SessionItem = ({ session }: { session: Session }) => (
    <div
      onClick={() => setSelectedSession(session)}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        session.status === SessionStatus.CONFIRMED
          ? "bg-[#23B685]/5 hover:bg-[#23B685]/10"
          : "border border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div>
        <h3 className="font-semibold text-[#243E36]">{session.type}</h3>
        <p className="text-sm text-gray-600">
          {session.dateTime.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">Spots available</p>
      </div>
      {getStatusBadge(session.status)}
    </div>
  );

  return (
    <>
      <div className="space-y-6 relative z-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coach Profile */}
          <Card className="border-[#23B685]/20">
            <CardHeader>
              <CardTitle className="text-[#243E36] flex items-center">
                <User className="mr-2 h-5 w-5" />
                Coach Profile
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Loading coach...</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-[#23B685]/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-[#23B685]" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#243E36]">
                        {coach?.name ?? "-"}
                      </h3>
                      <p className="text-gray-600">{coach?.email ?? "-"}</p>
                      <Badge className="bg-[#23B685]/10 text-[#23B685]">
                        Coach
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-[#243E36]">
                      {coach?.createdAt
                        ? new Date(coach.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="border-[#23B685]/20">
            <CardHeader>
              <CardTitle className="text-[#243E36] flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 overflow-y-auto max-h-[400px]">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming sessions</p>
              ) : (
                sessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <StatsGrid stats={stats} role={UserRole.COACH} />
      </div>

      <SessionDetailsModal
        session={selectedSession || undefined}
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
}
