import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Kid, type SessionKidRef } from '@grow-fitness/shared-types';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { cn } from '@/lib/utils';

import {
  Activity,
  AlertCircle,
  Baby,
  ChevronDown,
  ChevronUp,
  Target,
  Utensils,
} from 'lucide-react';

const AVATAR_COLORS = [
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
];

function calculateAge(birthDate: Date | string): number | null {
  const birth =
    typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function formatGender(gender?: string): string {
  if (!gender) return '-';

  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

interface SessionKidCardProps {
  kid: Kid | SessionKidRef;
  isLoading?: boolean;
}

export function SessionKidCard({ kid, isLoading }: SessionKidCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const age = kid.birthDate ? calculateAge(kid.birthDate) : null;

  const color = useMemo(() => {
    return AVATAR_COLORS[
      kid.name ? kid.name.charCodeAt(0) % AVATAR_COLORS.length : 0
    ];
  }, [kid.name]);

  const initials = kid.name
    ? kid.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '--';

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center font-semibold text-sm shrink-0',
                color.bg,
                color.text
              )}
            >
              {kid.profilePhotoUrl ? (
                <img
                  src={kid.profilePhotoUrl}
                  alt={kid.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate flex items-center gap-2">
                <Baby className="h-4 w-4 shrink-0" />
                {isLoading ? 'Loading...' : kid.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {kid.gender && (
                  <Badge variant="outline" className="text-[11px]">
                    {formatGender(kid.gender)}
                  </Badge>
                )}

                {age !== null && (
                  <Badge variant="secondary" className="text-[11px]">
                    {age} yrs
                  </Badge>
                )}

                {/* Stage */}
                {kid.stage && (
                  <Badge variant="secondary" className="text-[11px]">
                    {kid.stage}
                  </Badge>
                )}
              </div>

              {/* Birth Date */}
              <div className="mt-3 text-sm">
                <p className="text-muted-foreground text-xs">Birth Date</p>
                <p className="font-medium">
                  {isLoading ? '...' : formatDate(kid.birthDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <Activity
                className={cn(
                  'h-4 w-4 shrink-0',
                  kid.currentlyInSports ? 'text-green-600' : 'text-muted-foreground'
                )}
              />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Sports</p>
                <p className="text-xs font-medium truncate">
                  {kid.currentlyInSports ? 'Currently Active' : 'Not Active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <Utensils
                className={cn(
                  'h-4 w-4 shrink-0',
                  kid.mealPlan ? 'text-green-600' : 'text-muted-foreground'
                )}
              />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Meal Plan</p>
                <p className="text-xs font-medium truncate">
                  {kid.mealPlan ? 'Following Plan' : 'No Meal Plan'}
                </p>
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => setShowDetails(prev => !prev)}
          >
            {showDetails ? (
              <>
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Show More Details <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Expanded */}
        {showDetails && (
          <>
            <Separator />

            <div className="p-4 sm:p-5 space-y-5 bg-muted/10">
              {/* Session Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Session Type</p>
                  <p className="text-sm font-medium">
                    {formatSessionType(kid.sessionType)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Gender</p>
                  <p className="text-sm font-medium">{formatGender(kid.gender)}</p>
                </div>
              </div>

              {/* Goal */}
              {kid.goal && (
                <div className="flex items-start gap-3 rounded-lg border p-3 bg-background">
                  <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Goal</p>
                    <p className="text-sm">{kid.goal}</p>
                  </div>
                </div>
              )}

              {/* Medical Conditions */}
              {kid.medicalConditions?.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg border p-3 bg-background">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {kid.medicalConditions.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              {/* Notes */}
              {/* <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Notes</p>

                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add notes here..."
                  className="w-full min-h-[90px] rounded-md border bg-background p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"
                />

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveNote} disabled={!note.trim()}>
                    {noteSaved ? 'Saved ✓' : 'Save Note'}
                  </Button>
                </div>
              </div> */}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}