import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Target,
} from "lucide-react";

import { UserRole } from "@grow-fitness/shared-types";
import type { DashboardStats } from "@/types/dashboard";

interface StatsGridProps {
  stats: DashboardStats;
  role: UserRole.PARENT | UserRole.COACH;
}

export function StatsGrid({ stats, role }: StatsGridProps) {
  const coachStats = [
    {
      label: "Total Students",
      value: stats.totalStudents ?? 0,
      subtitle: "+2 this week",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Today's Sessions",
      value: stats.todaySessions ?? 0,
      subtitle: "Next at 3:00 PM",
      icon: Calendar,
      color: "text-gray-500",
    },
    {
      label: "Monthly Hours",
      value: stats.monthlyHours ?? 0,
      subtitle: "On track",
      icon: Clock,
      color: "text-green-600",
    },
    {
      label: "Avg Progress",
      value: `${stats.avgProgress ?? 0}%`,
      subtitle: "Excellent!",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  const parentStats = [
    {
      label: "My Children",
      value: stats.totalChildren ?? 0,
      subtitle: "Active members",
      icon: User,
      color: "text-green-600",
    },
    {
      label: "This Week",
      value: stats.upcomingSessions ?? 0,
      subtitle: "Sessions booked",
      icon: Calendar,
      color: "text-gray-500",
    },
    {
      label: "Weekly Progress",
      value: `${stats.weeklyProgress ?? 0}%`,
      subtitle: "Great improvement!",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Goals Achieved",
      value: stats.monthlyHours ?? 0,
      subtitle: "This month",
      icon: Target,
      color: "text-green-600",
    },
  ];

  const statsToShow =
    role === UserRole.COACH ? coachStats : parentStats;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsToShow.map((stat, index) => (
          <Card key={index} className="border-[#23B685]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-[#243E36]">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${stat.color}`}>
                    {stat.subtitle}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-[#23B685]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
