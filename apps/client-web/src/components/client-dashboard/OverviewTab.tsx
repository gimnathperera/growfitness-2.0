import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { type Kid } from '@grow-fitness/shared-types';
import { formatSessionType } from '@/lib/formatters';
import { UpcomingSessions } from '../common/UpcomingSessions';

interface OverviewTabProps {
  kid: Kid | null;
}

function formatGenderLabel(gender: string | undefined) {
  if (!gender) return '-';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export function OverviewTab({ kid }: OverviewTabProps) {
  const photoUrl = kid?.profilePhotoUrl?.trim();
  const ageYears =
    kid?.birthDate != null ? differenceInYears(new Date(), new Date(kid.birthDate)) : null;

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
          <UpcomingSessions kidId={kid?.id} parentKidSessionType={kid?.sessionType} />
        </CardContent>
      </Card>

      <Card className="border-[#23B685]/15">
        <CardHeader className="rounded-t-xl bg-[#23B685]/8 border-b border-[#23B685]/20">
          <CardTitle className="text-[#243E36] text-xl sm:text-2xl flex items-center">
            <User className="mr-2 h-6 w-6" />
            Child Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0 border-2 border-[#23B685]/25 ring-2 ring-background">
                <AvatarImage
                  src={photoUrl || undefined}
                  alt={kid?.name ? `${kid.name} profile photo` : 'Child profile'}
                  className="object-cover object-center"
                />
                <AvatarFallback className="bg-[#23B685]/10">
                  <User className="h-7 w-7 text-[#23B685]" strokeWidth={1.75} />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-[#243E36]">
                  {kid?.name ?? '-'}
                </h3>
                <p className="text-sm text-gray-600">
                  {ageYears != null && ageYears >= 0 ? `${ageYears} years old` : '-'}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="w-fit shrink-0 self-start sm:self-center bg-[#23B685]/10 text-[#23B685]"
            >
              Active Member
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="flex min-h-[5rem] flex-col justify-center gap-1 rounded-xl bg-[#23B685]/5 px-4 py-3">
              <p className="text-xs font-medium text-gray-600">Session Type</p>
              <p className="text-sm font-semibold text-[#243E36]">
                {kid?.sessionType ? formatSessionType(kid.sessionType) : '-'}
              </p>
            </div>
            <div className="flex min-h-[5rem] flex-col justify-center gap-1 rounded-xl bg-[#23B685]/5 px-4 py-3">
              <p className="text-xs font-medium text-gray-600">Gender</p>
              <p className="text-sm font-semibold text-[#243E36]">{formatGenderLabel(kid?.gender)}</p>
            </div>
            <div className="flex min-h-[5rem] flex-col justify-center gap-1 rounded-xl bg-[#23B685]/5 px-4 py-3">
              <p className="text-xs font-medium text-gray-600">Member Since</p>
              <p className="text-sm font-semibold text-[#243E36]">
                {kid?.createdAt ? new Date(kid.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
