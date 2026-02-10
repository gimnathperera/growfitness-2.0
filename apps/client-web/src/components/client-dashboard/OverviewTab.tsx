import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { UserRole, type Kid } from "@grow-fitness/shared-types";
import { StatsGrid } from "../common/StatGrid";
import type { DashboardStats } from "@/types/dashboard";
import { UpcomingSessions } from "../common/UpcomingSessions";

interface OverviewTabProps {
  kid: Kid | null;
}

export function OverviewTab({ kid }: OverviewTabProps) {
  // Temporary mock sessions & stats (replace later)
  const stats: DashboardStats = {
    totalChildren: 1,
    todaySessions: 1,
    upcomingSessions: 2,
    weeklyProgress: 75,
    avgProgress: 75,
  };

  return (
    <>
      <div className="space-y-6 relative z-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-[#23B685]/20">
            <CardHeader>
              <CardTitle className="text-[#243E36] flex items-center">
                <User className="mr-2 h-5 w-5" />
                Child Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#23B685]/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-[#23B685]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#243E36]">
                      {kid?.name ?? "-"}
                    </h3>
                    <p className="text-gray-600">
                      {kid?.birthDate
                        ? `${new Date().getFullYear() - new Date(kid.birthDate).getFullYear()} years old`
                        : "-"}
                    </p>
                    <Badge variant="secondary" className="bg-[#23B685]/10 text-[#23B685]">
                      Active Member
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Coach:</span>
                    <span className="text-sm font-medium text-[#243E36]">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Program:</span>
                    <span className="text-sm font-medium text-[#243E36]">Kids Fitness Fun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since:</span>
                    <span className="text-sm font-medium text-[#243E36]">
                      {kid?.createdAt ? new Date(kid.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#23B685]/20">
            <CardHeader>
              <CardTitle className="text-[#243E36] flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[400px]">
              <UpcomingSessions kidId={kid?.id} />
            </CardContent>
          </Card>
        </div>

        <StatsGrid stats={stats} role={UserRole.PARENT} />
      </div>
    </>
  );
}
