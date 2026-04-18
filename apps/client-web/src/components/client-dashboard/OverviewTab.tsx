import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar } from 'lucide-react';
import { type Kid } from '@grow-fitness/shared-types';
import { UpcomingSessions } from '../common/UpcomingSessions';

interface OverviewTabProps {
  kid: Kid | null;
}

export function OverviewTab({ kid }: OverviewTabProps) {
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
          <UpcomingSessions kidId={kid?.id} />
        </CardContent>
      </Card>

      <Card className="border-[#23B685]/15">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#243E36] text-base flex items-center">
            <User className="mr-2 h-4 w-4" />
            Child Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#23B685]/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-[#23B685]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#243E36]">{kid?.name ?? '-'}</h3>
                <p className="text-xs text-gray-600">
                  {kid?.birthDate
                    ? `${new Date().getFullYear() - new Date(kid.birthDate).getFullYear()} years old`
                    : '-'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit bg-[#23B685]/10 text-[#23B685]">
              Active Member
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
              <p className="text-xs text-gray-600">Current Coach</p>
              <p className="text-sm font-medium text-[#243E36]">-</p>
            </div>
            <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
              <p className="text-xs text-gray-600">Program</p>
              <p className="text-sm font-medium text-[#243E36]">Kids Fitness Fun</p>
            </div>
            <div className="rounded-lg bg-[#23B685]/5 px-3 py-2">
              <p className="text-xs text-gray-600">Member Since</p>
              <p className="text-sm font-medium text-[#243E36]">
                {kid?.createdAt ? new Date(kid.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
