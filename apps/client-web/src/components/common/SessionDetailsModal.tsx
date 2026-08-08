import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type Kid, type Session, type SessionKidRef, SessionType, sessionIsExtraSession } from '@grow-fitness/shared-types';
import { SessionKidCard } from '@/components/common/SessionKidCard';
import { SessionSpecialBadges } from '@/components/common/SessionSpecialBadges';
import { formatDateTime, formatSessionKindHeading, formatSessionType } from '@/lib/formatters';
import { useApiQuery } from '@/hooks/useApiQuery';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useModalParams } from '@/hooks/useModalParams';
import { useAuth } from '@/contexts/useAuth';
import { useKidOptional } from '@/contexts/kid/useKid';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Baby,
  CalendarClock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import RescheduleSessionDialog from './RescheduleSessionDialog';

interface SessionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  session?: Session;
  kidId?: string;
  coachId?: string;
  /** When set (e.g. from parent dashboard), gates reschedule vs kid enrolment profile. */
  parentKidSessionType?: SessionType;
  onReschedule?: (session: Session) => void;
}

type CoachObject = {
  coachProfile?: { name: string };
  email?: string;
};

type NamedObject = {
  name: string;
};

type NameableType = string | CoachObject | NamedObject | Kid | null | undefined;

// Helper to get name from populated object or return ID
function getName(value: NameableType, fallback: string = 'N/A'): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Check for CoachObject
    if ('coachProfile' in value || 'email' in value) {
      if (value.coachProfile?.name) return value.coachProfile.name;
      if (value.email) return value.email;
    }
    // Check for NamedObject
    if ('name' in value && value.name) {
      return value.name;
    }
  }
  return fallback;
}

function parentCanRescheduleSession(
  kidSessionType: SessionType | undefined,
  sessionType: SessionType | undefined,
): boolean {
  // Group-class rows: never parent-reschedulable.
  if (sessionType === SessionType.GROUP) return false;
  // Private/individual session: always allow (even for group-only enrolment when a private slot exists).
  if (sessionType === SessionType.INDIVIDUAL) return true;
  if (kidSessionType === SessionType.GROUP) return false;
  return true;
}

export default function SessionDetailsDialog({
  open,
  onClose,
  session: sessionProp,
  kidId: kidIdProp,
  parentKidSessionType,
}: SessionDetailsDialogProps) {
  const { entityId } = useModalParams('sessionId');
  const { role } = useAuth();
  const kidContext = useKidOptional();
  const effectiveKidSessionType =
    parentKidSessionType ?? kidContext?.selectedKid?.sessionType ?? undefined;
  // Fetch session from URL if prop not provided
  const { data: sessionFromUrl } = useApiQuery<Session>(
    ['sessions', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Session ID is required');
      }
      return sessionsService.getSessionById(entityId);
    },
    {
      enabled: open && !sessionProp && !!entityId,
    }
  );

  const session = sessionProp || sessionFromUrl;
  const sessionId = session?.id || entityId;
  const shouldFetch = open && !!sessionId && !!sessionProp;

  // Fetch session with populated data (only if we have sessionProp and need fresh data)
  const { data: sessionData, isLoading } = useApiQuery<Session>(
    ['sessions', sessionId || 'no-id'],
    () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return sessionsService.getSessionById(sessionId);
    },
    {
      enabled: shouldFetch,
    }
  );

  const displaySession = sessionData || session;
  const isGroupSession = displaySession?.type === SessionType.GROUP;

  const showParentReschedule =
    role === 'PARENT' &&
    parentCanRescheduleSession(effectiveKidSessionType, displaySession?.type);

  // Hide Kids tab if kidId prop is provided
  const shouldShowKidsTab = !kidIdProp;

  // Fetch coach details if coachId is available
  const coachId =
    typeof displaySession?.coachId === 'string'
      ? displaySession.coachId
      : typeof displaySession?.coachId === 'object' && displaySession?.coachId !== null
        ? (displaySession.coachId as { id: string }).id
        : undefined;
  const { data: coachData } = useApiQuery(
    ['users', 'coaches', coachId || 'no-id'],
    () => {
      if (!coachId) {
        throw new Error('Coach ID is required');
      }
      return usersService.getCoachById(coachId);
    },
    {
      enabled: shouldFetch && !!coachId,
    }
  );

  // Fetch location details if locationId is available
  const locationId =
    typeof displaySession?.locationId === 'string'
      ? displaySession.locationId
      : typeof displaySession?.locationId === 'object' &&
          displaySession?.locationId !== null &&
          'id' in displaySession.locationId
        ? (displaySession.locationId as { id: string }).id
        : undefined;
  const { data: locationData } = useApiQuery(
    ['locations', locationId || 'no-id'],
    () => {
      if (!locationId) {
        throw new Error('Location ID is required');
      }
      return locationsService.getLocationById(locationId);
    },
    {
      enabled: shouldFetch && !!locationId,
    }
  );

  // Fetch kids data for both group and individual sessions
  // Both session types can have kids in the kids array
  // Check if kids are already populated objects or just IDs
  const kidsFromSession = Array.isArray(displaySession?.kids) ? displaySession.kids : [];
  const isKidSummary = (kid: unknown): kid is SessionKidRef =>
    typeof kid === 'object' &&
    kid !== null &&
    'id' in kid &&
    'name' in kid &&
    'birthDate' in kid &&
    (kid as SessionKidRef).birthDate != null;

  const areKidsPopulated = kidsFromSession.length > 0 && isKidSummary(kidsFromSession[0]);

  type KidReference = string | { id: string; [key: string]: unknown };

  const kidsIds: string[] = areKidsPopulated
    ? [] // Kids are already populated, no need to fetch
    : (kidsFromSession as KidReference[])
        .map(kid => (typeof kid === 'string' ? kid : kid.id))
        .filter((id): id is string => Boolean(id));

  // Also check for kidId for individual sessions (fallback)
  const individualKidId =
    !isGroupSession && displaySession?.kidId && kidsIds.length === 0 && !areKidsPopulated
      ? displaySession.kidId
      : null;

  const shouldFetchKids = open && kidsIds.length > 0 && !areKidsPopulated;
  const shouldFetchIndividualKid =
    open && !isGroupSession && !!individualKidId && kidsIds.length === 0 && !areKidsPopulated;
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  // Fetch kids for both group and individual sessions from kids array (only if not already populated)
  const { data: kidsData } = useApiQuery(
    ['kids', 'session', sessionId || 'no-id'],
    async () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const kidsPromises = kidsIds.map(id => kidsService.getKidById(id));
      const results = await Promise.all(kidsPromises);
      return results;
    },
    {
      enabled: shouldFetchKids && !!sessionId,
    }
  );

  // Fetch kid for individual sessions using kidId (fallback if kids array is empty)
  const { data: individualKidData } = useApiQuery(
    ['kids', 'session', sessionId || 'no-id', 'individual'],
    () => {
      if (!individualKidId) {
        throw new Error('Kid ID is required');
      }
      return kidsService.getKidById(individualKidId);
    },
    {
      enabled: shouldFetchIndividualKid,
    }
  );

  const coachName =
    coachData?.coachProfile?.name ||
    coachData?.email ||
    getName(displaySession?.coachId, 'N/A') ||
    'N/A';
  const locationName = locationData?.name || getName(displaySession?.locationId, 'N/A') || 'N/A';

  // Combine kids data - use populated kids from session if available, otherwise use fetched data
  const kids = areKidsPopulated
    ? kidsFromSession
    : kidsData || (individualKidData ? [individualKidData] : []);

  // Calculate highlights
  const totalKids = kids.length;
  const capacity = displaySession?.capacity || 0;
  const enrolled = totalKids;

  if (!displaySession) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-[100vw] sm:max-w-[95vw] lg:max-w-6xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] p-0 flex flex-col overflow-hidden bg-[var(--gf-cream)] gf-scope rounded-none sm:rounded-2xl">
        <DialogTitle className="sr-only">Session Details</DialogTitle>
        <DialogDescription className="sr-only">View detailed information about this session</DialogDescription>

        {/* Header - Fixed */}
        <div className="m-2 sm:m-4 mb-0 sm:mb-0 pl-3 sm:pl-4 md:pl-6 pr-3 sm:pr-4 md:pr-6 py-2.5 sm:py-3 md:py-4 bg-[var(--gf-paper)] flex-shrink-0 border-2 border-[var(--gf-green-deep)] shadow-[3px_3px_0_0_var(--gf-green-deep)] sm:shadow-[4px_4px_0_0_var(--gf-green-deep)] rounded-xl sm:rounded-2xl">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2
                  className="text-sm sm:text-lg md:text-2xl font-extrabold text-[var(--gf-green-deep)] uppercase tracking-wide leading-tight break-words"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {displaySession.title?.trim() ||
                    formatSessionKindHeading(displaySession.type)}
                </h2>
                <SessionSpecialBadges session={displaySession} className="shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                <p className="text-[11px] sm:text-sm text-[var(--gf-green)] font-medium">
                  {formatDateTime(displaySession.dateTime)}
                </p>
                <StatusBadge status={displaySession.status} />
              </div>
              <p className="text-[10px] sm:text-xs text-[var(--gf-green)] mt-1 flex items-center gap-1 font-medium">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  Created {new Date(displaySession.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick-glance stat strip — mobile & tablet only, replaces the long sidebar list */}
        <div className="lg:hidden mx-2 sm:mx-4 mt-2 flex-shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="rounded-lg border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_0_var(--gf-green-deep)]">
              <Clock className="h-3.5 w-3.5 text-[var(--gf-green)] mb-0.5" />
              <span className="text-[9px] uppercase tracking-wide text-[var(--gf-green)] font-medium">Duration</span>
              <span className="text-[11px] font-extrabold text-[var(--gf-green-deep)] truncate w-full" style={{ fontFamily: 'var(--font-display)' }}>
                {displaySession.duration}m
              </span>
            </div>
            <div className="rounded-lg border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_0_var(--gf-green-deep)]">
              {isGroupSession ? (
                <Users className="h-3.5 w-3.5 text-[var(--gf-green)] mb-0.5" />
              ) : (
                <User className="h-3.5 w-3.5 text-[var(--gf-green)] mb-0.5" />
              )}
              <span className="text-[9px] uppercase tracking-wide text-[var(--gf-green)] font-medium">Type</span>
              <span className="text-[11px] font-extrabold text-[var(--gf-green-deep)] truncate w-full" style={{ fontFamily: 'var(--font-display)' }}>
                {formatSessionType(displaySession.type)}
              </span>
            </div>
            <div className="rounded-lg border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_0_var(--gf-green-deep)]">
              <Baby className="h-3.5 w-3.5 text-[var(--gf-green)] mb-0.5" />
              <span className="text-[9px] uppercase tracking-wide text-[var(--gf-green)] font-medium">
                {isGroupSession && capacity > 0 ? 'Capacity' : 'Free?'}
              </span>
              <span className="text-[11px] font-extrabold text-[var(--gf-green-deep)] truncate w-full" style={{ fontFamily: 'var(--font-display)' }}>
                {isGroupSession && capacity > 0 ? `${enrolled}/${capacity}` : (displaySession.isFreeSession ? 'Yes' : 'No')}
              </span>
            </div>
          </div>

          {showParentReschedule && (
            <Button
              onClick={() => setRescheduleOpen(true)}
              variant="outline"
              className="w-full mt-2 min-h-[44px] hover:bg-[var(--gf-green-50)]/30 border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--gf-green-deep)] active:translate-y-[1px] active:shadow-[0_0_0_0_var(--gf-green-deep)] transition-all rounded-xl text-xs"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Reschedule Session
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
          {/* Left Sidebar - desktop/tablet only (mobile uses the stat strip above instead); scrolls on its own */}
          <div className="hidden lg:flex lg:flex-col m-4 mt-4 w-80 rounded-2xl border bg-[var(--gf-paper)] overflow-y-auto flex-shrink-0 border-2 border-[var(--gf-green-deep)] shadow-[4px_4px_0_0_var(--gf-green-deep)]">
            <div className="p-4 md:p-6">
              {/* Session Info Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Session Info</h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg bg-[var(--gf-green-50)]/30 flex items-center justify-center flex-shrink-0 border border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                    {displaySession.type === SessionType.GROUP ? (
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-[var(--gf-green-deep)]" />
                    ) : (
                      <User className="h-6 w-6 md:h-8 md:w-8 text-[var(--gf-green-deep)]" />
                    )}
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm truncate text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatSessionType(displaySession.type)}
                    </p>
                    <p className="text-xs text-[var(--gf-green)] mt-0.5 font-medium">Training Session</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Details Section */}
              <div className="space-y-4 mb-6">
                <h3 className="font-extrabold text-sm text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[var(--gf-green)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[var(--gf-green)] block text-xs font-medium">Duration</span>
                      <p className="font-extrabold truncate text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{displaySession.duration} minutes</p>
                    </div>
                  </div>
                  {isGroupSession && capacity > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-[var(--gf-green)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[var(--gf-green)] block text-xs font-medium">Capacity</span>
                        <p className="font-extrabold truncate text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                          {enrolled} / {capacity}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--gf-green)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[var(--gf-green)] block text-xs font-medium">Date & Time</span>
                      <p className="font-extrabold text-sm break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {formatDateTime(displaySession.dateTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[var(--gf-green)] font-medium">Type</span>
                    <Badge variant="outline" className="text-xs border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatSessionType(displaySession.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[var(--gf-green)] font-medium">Status</span>
                    <StatusBadge status={displaySession.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[var(--gf-green)] font-medium">Free Session</span>
                    <span className="text-[var(--gf-green-deep)] text-sm font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                      {displaySession.isFreeSession ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[var(--gf-green)] font-medium">Extra session</span>
                    <span className="text-[var(--gf-green-deep)] text-sm font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                      {sessionIsExtraSession(displaySession) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {isGroupSession && (
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-[var(--gf-green)] font-medium">Enrolled</span>
                      <span className="text-[var(--gf-green-deep)] text-sm font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                        {enrolled} kids
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reschedule Button */}
              {showParentReschedule && (
                <>
                  <Separator className="my-6" />
                  <Button
                    onClick={() => setRescheduleOpen(true)}
                    variant="outline"
                    className="w-full min-h-[44px] hover:bg-[var(--gf-green-50)]/30 border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] font-extrabold uppercase tracking-wide shadow-[2px_2px_0_0_var(--gf-green-deep)] hover:shadow-[4px_4px_0_0_var(--gf-green-deep)] hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-[0_0_0_0_var(--gf-green-deep)] transition-all rounded-xl text-sm"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Reschedule Session
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Main Content - fixed-height panel. The tab list stays put; each TabsContent scrolls on its own. */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2.5 sm:p-4 md:p-6 bg-[var(--gf-cream)] mx-2 sm:mx-4 my-2 sm:my-4 lg:mt-4 rounded-xl sm:rounded-2xl">
            {isLoading ? (
              <div className="bg-[var(--gf-green-50)]/30 flex items-center justify-center h-48 sm:h-64 rounded-2xl border border-dashed border-[var(--line)]">
                <p className="text-[var(--gf-green)] font-extrabold animate-pulse text-sm sm:text-base" style={{ fontFamily: 'var(--font-display)' }}>Loading...</p>
              </div>
            ) : role === 'PARENT' ? (
              /* Parent view: Show overview directly without tabs */
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 sm:space-y-6 pb-4">
                {/* Session Details */}
                <div className="rounded-xl sm:rounded-2xl border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] p-3 sm:p-5 pt-4 sm:pt-12 shadow-[3px_3px_0_0_var(--gf-green-deep)] sm:shadow-[4px_4px_0_0_var(--gf-green-deep)]">
                    <h3 className="font-extrabold text-sm sm:text-lg mb-3 sm:mb-5 text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Session Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                      {/* Date & Time */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Date & Time
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                          {formatDateTime(displaySession.dateTime)}
                        </p>
                      </div>

                      {/* Coach */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Coach
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{coachName}</p>
                      </div>

                      {/* Location */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 sm:col-span-2 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Location
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--gf-green)] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{locationName}</p>
                            {locationData?.placeUrl && (
                              <a
                                href={locationData.placeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs sm:text-sm text-[var(--gf-green-deep)] hover:underline mt-1 inline-flex items-center gap-1.5 break-all font-extrabold"
                                style={{ fontFamily: 'var(--font-display)' }}
                              >
                                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                Open map / place link
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Type
                        </p>
                        <Badge variant="outline" className="w-fit border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] font-extrabold text-[10px] sm:text-xs" style={{ fontFamily: 'var(--font-display)' }}>
                          {formatSessionType(displaySession.type)}
                        </Badge>
                      </div>

                      {/* Duration */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Duration
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{displaySession.duration} minutes</p>
                      </div>

                      {/* Status */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Status
                        </p>
                        <StatusBadge status={displaySession.status} />
                      </div>

                      {/* Free Session */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Free Session
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                          {displaySession.isFreeSession ? 'Yes' : 'No'}
                        </p>
                      </div>

                      {/* Extra session */}
                      <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                        <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                          Extra Session
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                          {sessionIsExtraSession(displaySession) ? 'Yes' : 'No'}
                        </p>
                      </div>

                      {/* Capacity (Group only) */}
                      {isGroupSession && capacity > 0 && (
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 sm:col-span-2 border border-[var(--gf-green-deep)]">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Capacity
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {enrolled} / {capacity}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Coach/Admin view: Show tabs */
                <Tabs defaultValue="overview" className="w-full flex-1 min-h-0 flex flex-col">
                  <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:inline-flex gap-1.5 sm:gap-2 bg-[var(--gf-cream)] rounded-xl p-1 flex-shrink-0">
                    <TabsTrigger value="overview" className="border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)] text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg min-h-[38px]">
                      Overview
                    </TabsTrigger>
                    {shouldShowKidsTab && (
                      <TabsTrigger value="kids" className="border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)] text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[var(--fg-2)] hover:text-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)]/40 data-[state=active]:!bg-[var(--gf-green)] data-[state=active]:text-white rounded-lg min-h-[38px]">
                        Kids {totalKids > 0 && `(${totalKids})`}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-6 space-y-3 sm:space-y-6 pb-4">
                    {/* Session Details */}
                    <div className="rounded-xl sm:rounded-2xl border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] p-3 sm:p-5 pt-4 sm:pt-12 shadow-[3px_3px_0_0_var(--gf-green-deep)] sm:shadow-[4px_4px_0_0_var(--gf-green-deep)]">
                      <h3 className="font-extrabold text-sm sm:text-lg mb-3 sm:mb-5 text-[var(--gf-green-deep)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Session Information</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                        {/* Date & Time */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Date & Time
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatDateTime(displaySession.dateTime)}
                          </p>
                        </div>

                        {/* Coach */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Coach
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{coachName}</p>
                        </div>

                        {/* Location */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 sm:col-span-2 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Location
                          </p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--gf-green)] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-extrabold break-words text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{locationName}</p>
                              {locationData?.placeUrl && (
                                <a
                                  href={locationData.placeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm text-[var(--gf-green-deep)] hover:underline mt-1 inline-flex items-center gap-1.5 break-all font-extrabold"
                                  style={{ fontFamily: 'var(--font-display)' }}
                                >
                                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  Open map / place link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Type
                          </p>
                          <Badge variant="outline" className="w-fit border-[var(--gf-green-deep)] text-[var(--gf-green-deep)] font-extrabold text-[10px] sm:text-xs" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatSessionType(displaySession.type)}
                          </Badge>
                        </div>

                        {/* Duration */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Duration
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{displaySession.duration} minutes</p>
                        </div>

                        {/* Status */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Status
                          </p>
                          <StatusBadge status={displaySession.status} />
                        </div>

                        {/* Free Session */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Free Session
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {displaySession.isFreeSession ? 'Yes' : 'No'}
                          </p>
                        </div>

                        {/* Extra session */}
                        <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 border">
                          <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                            Extra Session
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                            {sessionIsExtraSession(displaySession) ? 'Yes' : 'No'}
                          </p>
                        </div>

                        {/* Capacity (Group only) */}
                        {isGroupSession && capacity > 0 && (
                          <div className="bg-[var(--gf-green-50)]/30 rounded-xl p-3 sm:p-4 space-y-1 sm:col-span-2 border border-[var(--gf-green-deep)]">
                            <p className="text-[10px] sm:text-xs font-extrabold text-[var(--gf-green)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                              Capacity
                            </p>
                            <p className="text-xs sm:text-sm font-extrabold text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
                              {enrolled} / {capacity}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {shouldShowKidsTab && (
                    <TabsContent value="kids" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-6 pb-4">
                      {totalKids === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <Baby className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--gf-green)] mx-auto mb-3 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-[var(--gf-green-deep)] font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                            No kids enrolled in this session
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                          {kids.map(kidOrId => {
                            const kidId =
                              typeof kidOrId === 'string'
                                ? kidOrId
                                : (kidOrId as Kid | SessionKidRef).id;
                            const kid =
                              typeof kidOrId === 'string'
                                ? ({
                                    id: kidId,
                                    parentId: '',
                                    name: 'Loading...',
                                    gender: '',
                                    birthDate: new Date(0),
                                    currentlyInSports: false,
                                    medicalConditions: [],
                                    sessionType: SessionType.GROUP,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                  } satisfies Kid)
                                : (kidOrId as Kid | SessionKidRef);

                            return (
                              <SessionKidCard
                                key={kidId}
                                kid={kid}
                                isLoading={typeof kidOrId === 'string'}
                              />
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </div>
          </div>
          <RescheduleSessionDialog
            open={rescheduleOpen}
            onClose={() => setRescheduleOpen(false)}
            sessionId={displaySession.id}
          />
        </DialogContent>
      </Dialog>
    );
  }