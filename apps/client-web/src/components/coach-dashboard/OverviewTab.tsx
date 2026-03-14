import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Calendar, Phone, MapPin, Building2, Clock, Briefcase, FileText } from "lucide-react";
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coach Profile */}
        <Card className="border-[#23B685]/20">
          <CardHeader>
            <CardTitle className="text-[#243E36] flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Coach Profile
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading coach...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                {/* Top Section */}
                <div className="flex items-center space-x-4">
                  {coach?.coachProfile?.photoUrl ? (
                    <img
                      src={coach.coachProfile.photoUrl}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#23B685]/10 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-[#23B685]" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-[#243E36]">
                      {coach?.coachProfile?.name ?? "-"}
                    </h3>

                    <p className="text-gray-600">{coach?.email ?? "-"}</p>

                    <Badge
                      className={`mt-1 ${
                        coach?.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coach?.status ?? "-"}
                    </Badge>
                  </div>
                </div>

                {/* DOB */}
                {coach?.coachProfile?.dateOfBirth && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">Date of birth</span>
                    <span className="font-medium text-[#243E36]">
                      {formatDate(
                        typeof coach.coachProfile.dateOfBirth === "string"
                          ? coach.coachProfile.dateOfBirth
                          : (coach.coachProfile.dateOfBirth as Date)
                      )}
                    </span>
                  </div>
                )}

                {/* Phone */}
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </span>
                  <span className="font-medium text-[#243E36]">
                    {coach?.phone ?? "-"}
                  </span>
                </div>

                {/* Home address */}
                {coach?.coachProfile?.homeAddress && (
                  <div className="flex justify-between text-sm items-start gap-2">
                    <span className="text-gray-600 flex items-center gap-1 shrink-0">
                      <MapPin className="h-4 w-4" />
                      Address
                    </span>
                    <span className="font-medium text-[#243E36] text-right">
                      {coach.coachProfile.homeAddress}
                    </span>
                  </div>
                )}

                {/* School */}
                {coach?.coachProfile?.school && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      School
                    </span>
                    <span className="font-medium text-[#243E36]">
                      {coach.coachProfile.school}
                    </span>
                  </div>
                )}

                {/* Available times */}
                {coach?.coachProfile?.availableTimes &&
                  coach.coachProfile.availableTimes.length > 0 && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Available times
                      </span>
                      <ul className="list-disc list-inside text-[#243E36] space-y-0.5">
                        {coach.coachProfile.availableTimes.map((slot, i) => (
                          <li key={i}>
                            {slot.dayOfWeek} {slot.startTime}–{slot.endTime}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Employment type */}
                {coach?.coachProfile?.employmentType && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Employment
                    </span>
                    <span className="font-medium text-[#243E36]">
                      {coach.coachProfile.employmentType.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {/* CV link */}
                {coach?.coachProfile?.cvUrl && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      CV
                    </span>
                    <a
                      href={coach.coachProfile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#23B685] hover:underline font-medium"
                    >
                      View CV
                    </a>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex justify-between text-sm border-t pt-3">
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
            <UpcomingSessions coachId={coachId} />
          </CardContent>
        </Card>
      </div>

      <StatsGrid stats={stats} role={UserRole.COACH} />
    </div>
  );
}
