import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Calendar, Phone, MapPin, Briefcase } from "lucide-react";
import { UserRole, type User } from "@grow-fitness/shared-types";
import { StatsGrid } from "../common/StatGrid";
import type { DashboardStats } from "@/types/dashboard";
import { useAuth } from "@/contexts/useAuth";
import { UpcomingSessions } from "../common/UpcomingSessions";
import { usersService } from "@/services/users.service";

function formatDate(value: Date | string | undefined): string {
  if (!value) return "–";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString();
}

export function OverviewTab() {
  const { user } = useAuth();
  const coachId = user?.id;

  const [coach, setCoach] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) return;

    const fetchCoach = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await usersService.getCoachById(coachId);

        setCoach(response);
      } catch (err) {
        console.error("Failed to fetch coach:", err);
        setError("Failed to load coach profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [coachId]);

  const stats: DashboardStats = {
    totalChildren: 12,
    todaySessions: 3,
    upcomingSessions: 5,
    weeklyProgress: 80,
    avgProgress: 78,
  };

  return (
    <div className="space-y-6 relative z-0">
      <Card className="border-[#23B685]/30 shadow-sm">
        <CardHeader className="rounded-t-xl bg-[#23B685]/8 border-b border-[#23B685]/20">
          <CardTitle className="text-[#243E36] text-xl sm:text-2xl flex items-center">
            <Calendar className="mr-2 h-6 w-6" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <UpcomingSessions coachId={coachId} />
        </CardContent>
      </Card>

      <Card className="border-[#23B685]/15">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#243E36] text-base flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Coach Profile Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading coach...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  {coach?.coachProfile?.photoUrl ? (
                    <img
                      src={coach.coachProfile.photoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-[#23B685]/10 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-[#23B685]" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-[#243E36]">
                      {coach?.coachProfile?.name ?? "-"}
                    </h3>
                    <p className="text-xs text-gray-600">{coach?.email ?? "-"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      coach?.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {coach?.status ?? "-"}
                  </Badge>
                  {coach?.coachProfile?.employmentType && (
                    <Badge variant="secondary" className="bg-[#23B685]/10 text-[#23B685]">
                      <Briefcase className="mr-1 h-3 w-3" />
                      {coach.coachProfile.employmentType.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
                  <p className="text-xs text-gray-600">Member Since</p>
                  <p className="text-sm font-medium text-[#243E36]">
                    {coach?.createdAt ? new Date(coach.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>

                <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
                  <p className="text-xs text-gray-600">Date of Birth</p>
                  <p className="text-sm font-medium text-[#243E36]">
                    {formatDate(
                      typeof coach?.coachProfile?.dateOfBirth === "string"
                        ? coach.coachProfile.dateOfBirth
                        : (coach?.coachProfile?.dateOfBirth as Date | undefined)
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="text-sm font-medium text-[#243E36]">{coach?.phone ?? "-"}</p>
                </div>

                <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </p>
                  <p className="text-sm font-medium text-[#243E36] truncate">
                    {coach?.coachProfile?.homeAddress ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StatsGrid stats={stats} role={UserRole.COACH} />
    </div>
  );
}
