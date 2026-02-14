import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type Kid, type Session, SessionType } from '@grow-fitness/shared-types';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { useApiQuery } from '@/hooks/useApiQuery';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useModalParams } from '@/hooks/useModalParams';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Activity,
  Award,
  AlertCircle,
  Baby,
  CalendarClock,
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
  kidId: kidIdProp}: SessionDetailsDialogProps) {
  const { entityId } = useModalParams('sessionId');
  
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
  const coachId = typeof displaySession?.coachId === 'string' 
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
  const locationId = typeof displaySession?.locationId === 'string' 
    ? displaySession.locationId 
    : typeof displaySession?.locationId === 'object' && displaySession?.locationId !== null && 'id' in displaySession.locationId
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
  const areKidsPopulated = kidsFromSession.length > 0 && 
    typeof kidsFromSession[0] === 'object' && 
    kidsFromSession[0] !== null &&
    'name' in kidsFromSession[0] && 
    typeof (kidsFromSession[0] as { name: unknown }).name === 'string';
  
  type KidReference = string | { id: string; [key: string]: unknown };
  
  const kidsIds: string[] = areKidsPopulated
    ? [] // Kids are already populated, no need to fetch
    : (kidsFromSession as KidReference[]).map((kid) => (typeof kid === 'string' ? kid : kid.id)).filter((id): id is string => Boolean(id));
  
  // Also check for kidId for individual sessions (fallback)
  const individualKidId = !isGroupSession && displaySession?.kidId && kidsIds.length === 0 && !areKidsPopulated
    ? displaySession.kidId
    : null;
  
  const shouldFetchKids = open && kidsIds.length > 0 && !areKidsPopulated;
  const shouldFetchIndividualKid = open && !isGroupSession && !!individualKidId && kidsIds.length === 0 && !areKidsPopulated;
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

  const coachName = coachData?.coachProfile?.name || coachData?.email || getName(displaySession?.coachId, 'N/A') || 'N/A';
  const locationName = locationData?.name || getName(displaySession?.locationId, 'N/A') || 'N/A';
  
  // Combine kids data - use populated kids from session if available, otherwise use fetched data
  const kids = areKidsPopulated 
    ? kidsFromSession 
    : (kidsData || (individualKidData ? [individualKidData] : []));

  // Calculate highlights
  const totalKids = kids.length;
  const capacity = displaySession?.capacity || 0;
  const enrolled = totalKids;

  if (!displaySession) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-semibold truncate">
                {formatSessionType(displaySession.type)} Session
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {formatDateTime(displaySession.dateTime)}
                </p>
                <StatusBadge status={displaySession.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  Created {new Date(displaySession.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
          {/* Left Sidebar - Scrollable on mobile, fixed height on desktop */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/20 overflow-y-auto flex-shrink-0">
            <div className="p-4 sm:p-6">
              {/* Session Info Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Session Info</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {displaySession.type === SessionType.GROUP ? (
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    ) : (
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {formatSessionType(displaySession.type)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Training Session</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Details Section */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-sm">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground block text-xs">Duration</span>
                      <p className="font-medium truncate">{displaySession.duration} minutes</p>
                    </div>
                  </div>
                  {isGroupSession && capacity > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block text-xs">Capacity</span>
                        <p className="font-medium truncate">{enrolled} / {capacity}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground block text-xs">Date & Time</span>
                      <p className="font-medium text-xs sm:text-sm break-words">
                        {formatDateTime(displaySession.dateTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="text-xs">
                      {formatSessionType(displaySession.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={displaySession.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground">Free Session</span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {displaySession.isFreeSession ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {isGroupSession && (
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {enrolled} kids
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reschedule Button */}
              {!isGroupSession && (
                <>
                  <Separator />
                  <Button
                    onClick={() => setRescheduleOpen(true)}
                    variant="outline"
                    className="w-full mt-6 hover:bg-muted"
                  >
                    <CalendarClock className="h-4 w-4 mr-2 hover:bg-muted"/>
                    Reschedule Session
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                    Overview
                  </TabsTrigger>
                  {shouldShowKidsTab && (
                    <TabsTrigger value="kids" className="flex-1 sm:flex-none">
                      Kids {totalKids > 0 && `(${totalKids})`}
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Session Details */}
                  <div className="rounded-2xl border bg-card p-5 pt-12 shadow-sm">
                    <h3 className="font-semibold text-lg mb-5">Session Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Date & Time */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Date & Time
                        </p>
                        <p className="text-sm font-medium break-words">
                          {formatDateTime(displaySession.dateTime)}
                        </p>
                      </div>

                      {/* Coach */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Coach
                        </p>
                        <p className="text-sm font-medium break-words">
                          {coachName}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1 sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Location
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium break-words">
                            {locationName}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Type
                        </p>
                        <Badge variant="outline" className="w-fit">
                          {formatSessionType(displaySession.type)}
                        </Badge>
                      </div>

                      {/* Duration */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Duration
                        </p>
                        <p className="text-sm font-medium">
                          {displaySession.duration} minutes
                        </p>
                      </div>

                      {/* Status */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Status
                        </p>
                        <StatusBadge status={displaySession.status} />
                      </div>

                      {/* Free Session */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Free Session
                        </p>
                        <p className="text-sm font-medium">
                          {displaySession.isFreeSession ? "Yes" : "No"}
                        </p>
                      </div>

                      {/* Capacity (Group only) */}
                      {isGroupSession && capacity > 0 && (
                        <div className="bg-muted/40 rounded-xl p-4 space-y-1 sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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

                {shouldShowKidsTab && (
                  <TabsContent value="kids" className="mt-6">
                    {totalKids === 0 ? (
                      <div className="text-center py-12">
                        <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No kids enrolled in this session</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {kids.map((kidOrId) => {
                        // Handle case where kid is either a string ID or a Kid object
                        const kid: Kid = typeof kidOrId === 'string' 
                          ? { 
                              id: kidOrId, 
                              parentId: '',
                              name: 'Loading...',
                              gender: 'other',
                              birthDate: new Date(),
                              currentlyInSports: false,
                              medicalConditions: [],
                              sessionType: 'GROUP' as SessionType,
                              achievements: [],
                              createdAt: new Date(),
                              updatedAt: new Date()
                            }
                          : kidOrId;

                        return (
                          <Card key={kid.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                                  <Baby className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{kid.name}</span>
                                </CardTitle>
                                {kid.gender && (
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {kid.gender}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="min-w-0">
                                  <p className="text-muted-foreground text-xs">Birth Date</p>
                                  <p className="font-medium text-xs sm:text-sm truncate">
                                    {kid.birthDate ? new Date(kid.birthDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                {kid.goal && (
                                  <div className="col-span-2 min-w-0">
                                    <p className="text-muted-foreground text-xs">Goal</p>
                                    <p className="font-medium text-xs sm:text-sm break-words">
                                      {kid.goal}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Activity
                                    className={`h-4 w-4 flex-shrink-0 ${
                                      kid.currentlyInSports
                                        ? 'text-green-600'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                  <span className="text-xs text-muted-foreground truncate">
                                    {kid.currentlyInSports ? 'In Sports' : 'Not in Sports'}
                                  </span>
                                </div>
                              </div>

                              {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Medical Conditions
                                    </p>
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

                              {kid.achievements && kid.achievements.length > 0 && (
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <Award className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">Achievements</p>
                                    <div className="flex flex-wrap gap-1">
                                      {kid.achievements.map((achievement: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {achievement}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
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