import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { User, Kid } from '@grow-fitness/shared-types';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usersService } from '@/services/users.service';
import { useModalParams } from '@/hooks/useModalParams';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Baby,
  Target,
  Activity,
  Award,
  AlertCircle,
} from 'lucide-react';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}

interface ParentWithKids extends User {
  kids?: Kid[];
}

export function UserDetailsDialog({ open, onOpenChange, user: userProp }: UserDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('userId');
  
  // Fetch user from URL if prop not provided
  const { data: userFromUrl } = useApiQuery<User>(
    ['users', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('User ID is required');
      }
      // Try to determine if it's a parent or coach by fetching both
      return usersService.getParentById(entityId).catch(() => usersService.getCoachById(entityId));
    },
    {
      enabled: open && !userProp && !!entityId,
    }
  );

  const user = userProp || userFromUrl;
  const isParent = !!user?.parentProfile;
  const isCoach = !!user?.coachProfile;

  // Fetch parent with kids if it's a parent, or coach if it's a coach
  // We always fetch to ensure we have the latest data with populated kids
  const userId = user?.id || entityId;
  const shouldFetchParent = isParent && open && !!userId;
  const shouldFetchCoach = isCoach && open && !!userId;

  const {
    data: parentData,
    isLoading: isLoadingParent,
  } = useApiQuery<ParentWithKids>(
    ['users', 'parents', userId || 'no-id'],
    () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return usersService.getParentById(userId);
    },
    {
      enabled: shouldFetchParent,
    }
  );

  const {
    data: coachData,
    isLoading: isLoadingCoach,
  } = useApiQuery<User>(
    ['users', 'coaches', userId || 'no-id'],
    () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return usersService.getCoachById(userId);
    },
    {
      enabled: shouldFetchCoach,
    }
  );

  const displayUser = (parentData as ParentWithKids) || (coachData as User) || user;
  const kids = (displayUser as ParentWithKids).kids || [];
  const userName = isParent
    ? user?.parentProfile?.name
    : isCoach
      ? user?.coachProfile?.name
      : 'N/A';

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!user) {
    return null;
  }
  const initials = (userName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isLoading = isLoadingParent || isLoadingCoach;

  // Calculate highlights for parents
  const totalKids = kids.length;
  const kidsInSports = kids.filter(k => k.currentlyInSports).length;
  const individualSessions = kids.filter(k => k.sessionType === 'INDIVIDUAL').length;
  const groupSessions = kids.filter(k => k.sessionType === 'GROUP').length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{userName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <StatusBadge status={user.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r bg-muted/20 p-6 overflow-y-auto min-h-0">
              {/* Profile Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Profile</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarFallback className="text-base">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{userName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Parent Account</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact Section */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-sm">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phone}</span>
                  </div>
                  {user.parentProfile?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.parentProfile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Kids</span>
                    <span className="text-muted-foreground">{totalKids}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Sports</span>
                    <span className="text-muted-foreground">{kidsInSports}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Individual Sessions</span>
                    <span className="text-muted-foreground">{individualSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Group Sessions</span>
                    <span className="text-muted-foreground">{groupSessions}</span>
                  </div>
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
                    <TabsTrigger value="children">
                      Children {totalKids > 0 && `(${totalKids})`}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* About Section */}
                    <div>
                      <h3 className="font-semibold mb-3">About</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                          <p className="text-sm">{userName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                          <p className="text-sm">{user.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                          <p className="text-sm">{user.phone}</p>
                        </div>
                        {user.parentProfile?.location && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Location
                            </h4>
                            <p className="text-sm">{user.parentProfile.location}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                          <StatusBadge status={user.status} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Member Since
                          </h4>
                          <p className="text-sm">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="children" className="mt-6">
                    {totalKids === 0 ? (
                      <div className="text-center py-12">
                        <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No children registered yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kids.map((kid) => (
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
                                  <p className="font-medium">{formatDate(kid.birthDate)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Session Type</p>
                                  <p className="font-medium">
                                    {formatSessionType(kid.sessionType)}
                                  </p>
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
                                      {kid.medicalConditions.map((condition, idx) => (
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
