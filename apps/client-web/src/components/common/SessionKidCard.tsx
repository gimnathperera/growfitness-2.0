import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Kid, type SessionKidRef } from '@grow-fitness/shared-types';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Activity, AlertCircle, Baby, ChevronDown, Target } from 'lucide-react';

function calculateAge(birthDate: Date | string): number | null {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function formatGender(gender: string): string {
  if (!gender) return gender;
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

interface SessionKidCardProps {
  kid: Kid | SessionKidRef;
  isLoading?: boolean;
}

export function SessionKidCard({ kid, isLoading }: SessionKidCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const age = kid.birthDate ? calculateAge(kid.birthDate) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
            <Baby className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{isLoading ? 'Loading...' : kid.name}</span>
          </CardTitle>
          {kid.gender && !isLoading && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {formatGender(kid.gender)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Birth Date</p>
            <p className="font-medium text-xs sm:text-sm truncate">
              {isLoading ? '...' : formatDate(kid.birthDate)}
            </p>
          </div>
          {age !== null && (
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Age</p>
              <p className="font-medium text-xs sm:text-sm">{age} years</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 min-w-0">
            <Activity
              className={cn(
                'h-4 w-4 flex-shrink-0',
                kid.currentlyInSports ? 'text-green-600' : 'text-muted-foreground'
              )}
            />
            <span className="text-xs text-muted-foreground truncate">
              {kid.currentlyInSports ? 'In Sports' : 'Not in Sports'}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => setShowDetails(prev => !prev)}
        >
          {showDetails ? 'Show less' : 'Show more details'}
          <ChevronDown
            className={cn('ml-1 h-3.5 w-3.5 transition-transform', showDetails && 'rotate-180')}
          />
        </Button>
        {showDetails && (
          <div className="space-y-3 pt-2 border-t text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Session Type</p>
                <p className="font-medium text-xs sm:text-sm">
                  {formatSessionType(kid.sessionType)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Gender</p>
                <p className="font-medium text-xs sm:text-sm">{formatGender(kid.gender)}</p>
              </div>
            </div>
            {kid.goal && (
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Goal</p>
                  <p className="text-xs sm:text-sm break-words">{kid.goal}</p>
                </div>
              </div>
            )}
            {kid.medicalConditions && kid.medicalConditions.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs mb-1">Medical Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {kid.medicalConditions.map((condition: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
