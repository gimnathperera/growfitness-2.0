import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Session, SessionType } from '@grow-fitness/shared-types';
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
  Target,
  Activity,
  Award,
  AlertCircle,
  Baby,
} from 'lucide-react';

interface SessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
}

// Helper to get name from populated object or return ID
function getName(value: any, fallback: string = 'N/A'): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Coach object
    if (value.coachProfile?.name) return value.coachProfile.name;
    if (value.email) return value.email;
    // Location object
    if (value.name) return value.name;
    // Kid object
    if (value.name) return value.name;
  }
  return fallback;
}

export function SessionDetailsDialog({ open, onOpenChange, session: sessionProp }: SessionDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('sessionId');
  
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

  // Fetch coach details if coachId is available
  const coachId = typeof displaySession?.coachId === 'string' ? displaySession.coachId : (displaySession?.coachId as any)?.id;
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
  const locationId = typeof displaySession?.locationId === 'string' ? displaySession.locationId : (displaySession?.locationId as any)?.id;
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
  const areKidsPopulated = kidsFromSession.length > 0 && typeof kidsFromSession[0] === 'object' && 'name' in kidsFromSession[0] && typeof (kidsFromSession[0] as any).name === 'string';
  
  const kidsIds: string[] = areKidsPopulated
    ? [] // Kids are already populated, no need to fetch
    : kidsFromSession.map((kid: any) => (typeof kid === 'string' ? kid : kid.id)).filter((id): id is string => Boolean(id));
  
  // Also check for kidId for individual sessions (fallback)
  const individualKidId = !isGroupSession && displaySession?.kidId && kidsIds.length === 0 && !areKidsPopulated
    ? (typeof displaySession.kidId === 'string' ? displaySession.kidId : (displaySession.kidId as any)?.id)
    : null;
  
  const shouldFetchKids = open && kidsIds.length > 0 && !areKidsPopulated;
  const shouldFetchIndividualKid = open && !isGroupSession && !!individualKidId && kidsIds.length === 0 && !areKidsPopulated;

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

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!displaySession) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{formatSessionType(displaySession.type)} Session</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{formatDateTime(displaySession.dateTime)}</p>
                  <StatusBadge status={displaySession.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {new Date(displaySession.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r bg-muted/20 p-6 overflow-y-auto min-h-0">
              {/* Session Info Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Session Info</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {displaySession.type === SessionType.GROUP ? (
                      <Users className="h-8 w-8 text-primary" />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{formatSessionType(displaySession.type)}</p>
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{displaySession.duration} minutes</p>
                    </div>
                  </div>
                  {isGroupSession && capacity > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">Capacity</span>
                        <p className="font-medium">{enrolled} / {capacity}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Date & Time</span>
                      <p className="font-medium">{formatDateTime(displaySession.dateTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{formatSessionType(displaySession.type)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={displaySession.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Free Session</span>
                    <span className="text-muted-foreground">{displaySession.isFreeSession ? 'Yes' : 'No'}</span>
                  </div>
                  {isGroupSession && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="text-muted-foreground">{enrolled} kids</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="kids">
                      Kids {totalKids > 0 && `(${totalKids})`}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Session Details */}
                    <div>
                      <h3 className="font-semibold mb-3">Session Information</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h4>
                          <p className="text-sm">{formatDateTime(displaySession.dateTime)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Coach</h4>
                          <p className="text-sm">{coachName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{locationName}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                          <Badge variant="outline">{formatSessionType(displaySession.type)}</Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                          <p className="text-sm">{displaySession.duration} minutes</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                          <StatusBadge status={displaySession.status} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Free Session</h4>
                          <p className="text-sm">{displaySession.isFreeSession ? 'Yes' : 'No'}</p>
                        </div>
                        {isGroupSession && capacity > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Capacity</h4>
                            <p className="text-sm">{enrolled} / {capacity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="kids" className="mt-6">
                    {totalKids === 0 ? (
                      <div className="text-center py-12">
                        <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No kids enrolled in this session</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kids.map((kid: any) => (
                          <Card key={kid.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Baby className="h-4 w-4" />
                                  {kid.name}
                                </CardTitle>
                                <Badge variant="outline">{kid.gender}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Birth Date</p>
                                  <p className="font-medium">{new Date(kid.birthDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Session Type</p>
                                  <p className="font-medium">{formatSessionType(kid.sessionType)}</p>
                                </div>
                              </div>

                              {kid.goal && (
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Goal</p>
                                    <p className="text-sm">{kid.goal}</p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2">
                                  <Activity
                                    className={`h-4 w-4 ${
                                      kid.currentlyInSports
                                        ? 'text-green-600'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {kid.currentlyInSports ? 'In Sports' : 'Not in Sports'}
                                  </span>
                                </div>
                              </div>

                              {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div>
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
                                  <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Achievements
                                    </p>
                                    <p className="text-xs">
                                      {kid.achievements.length} achievement(s)
                                    </p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
