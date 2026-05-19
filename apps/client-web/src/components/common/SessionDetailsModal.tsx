import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type Kid, type Session, type SessionKidRef, SessionType, sessionIsExtraSession } from '@grow-fitness/shared-types';
import { SessionKidCard } from '@/components/common/SessionKidCard';
import { SessionSpecialBadges } from '@/components/common/SessionSpecialBadges';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { useApiQuery } from '@/hooks/useApiQuery';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useModalParams } from '@/hooks/useModalParams';
import { useAuth } from '@/contexts/useAuth';
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

export default function SessionDetailsDialog({
  open,
  onClose,
  session: sessionProp,
  kidId: kidIdProp,
}: SessionDetailsDialogProps) {
  const { entityId } = useModalParams('sessionId');
  const { role } = useAuth();
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
  <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-[95vw] lg:max-w-6xl sm:h-[92vh] p-0 flex flex-col overflow-hidden rounded-none sm:rounded-2xl">
    {/* Header */}
    <div className="px-4 sm:px-6 py-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-semibold leading-tight break-words">
              {displaySession.title?.trim() ||
                `${formatSessionType(displaySession.type)} Session`}
            </h2>

            <SessionSpecialBadges
              session={displaySession}
              className="shrink-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {formatDateTime(displaySession.dateTime)}
            </p>

            <StatusBadge status={displaySession.status} />
          </div>

          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            Created{' '}
            {new Date(displaySession.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-[320px] xl:w-[360px] border-b lg:border-b-0 lg:border-r bg-muted/20 overflow-y-auto flex-shrink-0 max-h-[50vh] lg:max-h-none">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Session Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Session Info</h3>

            <div className="flex items-center gap-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {displaySession.type === SessionType.GROUP ? (
                  <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                ) : (
                  <User className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base truncate">
                  {formatSessionType(displaySession.type)}
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  Training Session
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Duration</p>

                  <p className="text-sm font-medium">
                    {displaySession.duration} minutes
                  </p>
                </div>
              </div>

              {isGroupSession && capacity > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Capacity</p>

                    <p className="text-sm font-medium">
                      {enrolled} / {capacity}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Date & Time
                  </p>

                  <p className="text-sm font-medium break-words leading-relaxed">
                    {formatDateTime(displaySession.dateTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Highlights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Highlights</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Type</span>

                <Badge variant="outline" className="text-xs shrink-0">
                  {formatSessionType(displaySession.type)}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Status</span>

                <StatusBadge status={displaySession.status} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Free Session
                </span>

                <span className="text-sm font-medium">
                  {displaySession.isFreeSession ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Extra Session
                </span>

                <span className="text-sm font-medium">
                  {sessionIsExtraSession(displaySession) ? 'Yes' : 'No'}
                </span>
              </div>

              {isGroupSession && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    Enrolled
                  </span>

                  <span className="text-sm font-medium">
                    {enrolled} kids
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reschedule */}
          {role === 'PARENT' && (
            <>
              <Separator />

              <Button
                onClick={() => setRescheduleOpen(true)}
                variant="outline"
                className="w-full h-11"
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Reschedule Session
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger
                  value="overview"
                  className="w-full sm:w-auto"
                >
                  Overview
                </TabsTrigger>

                {shouldShowKidsTab && (
                  <TabsTrigger
                    value="kids"
                    className="w-full sm:w-auto"
                  >
                    Kids {totalKids > 0 && `(${totalKids})`}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="mt-6">
                <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-5">
                    Session Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Date & Time
                      </p>

                      <p className="text-sm font-medium break-words leading-relaxed">
                        {formatDateTime(displaySession.dateTime)}
                      </p>
                    </div>

                    {/* Coach */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Coach
                      </p>

                      <p className="text-sm font-medium break-words">
                        {coachName}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="rounded-xl bg-muted/40 p-4 md:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Location
                      </p>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />

                        <div className="min-w-0">
                          <p className="text-sm font-medium break-words">
                            {locationName}
                          </p>

                          {locationData?.placeUrl && (
                            <a
                              href={locationData.placeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2 break-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                              Open map / place link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Type
                      </p>

                      <Badge variant="outline" className="w-fit">
                        {formatSessionType(displaySession.type)}
                      </Badge>
                    </div>

                    {/* Duration */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Duration
                      </p>

                      <p className="text-sm font-medium">
                        {displaySession.duration} minutes
                      </p>
                    </div>

                    {/* Status */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Status
                      </p>

                      <StatusBadge status={displaySession.status} />
                    </div>

                    {/* Free */}
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Free Session
                      </p>

                      <p className="text-sm font-medium">
                        {displaySession.isFreeSession ? 'Yes' : 'No'}
                      </p>
                    </div>

                    {/* Capacity */}
                    {isGroupSession && capacity > 0 && (
                      <div className="rounded-xl bg-muted/40 p-4 md:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Capacity
                        </p>

                        <p className="text-sm font-medium">
                          {enrolled} / {capacity}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* KIDS */}
              {shouldShowKidsTab && (
                <TabsContent value="kids" className="mt-6">
                  {totalKids === 0 ? (
                    <div className="text-center py-16">
                      <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

                      <p className="text-sm text-muted-foreground">
                        No kids enrolled in this session
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                      {kids.map(kidOrId => {
                        const kidId =
                          typeof kidOrId === 'string'
                            ? kidOrId
                            : (kidOrId as Kid | SessionKidRef).id;

                        const kid =
                          typeof kidOrId === 'string'
                            ? ({
                                id: kidOrId,
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
