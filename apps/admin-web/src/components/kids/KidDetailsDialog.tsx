import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Kid } from '@grow-fitness/shared-types';
import { formatDate, formatSessionType } from '@/lib/formatters';
import { useApiQuery } from '@/hooks/useApiQuery';
import { kidsService } from '@/services/kids.service';
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
  Users,
} from 'lucide-react';

interface KidDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kid: Kid;
}

interface KidWithParent extends Kid {
  parent?: {
    id: string;
    email: string;
    phone?: string;
    parentProfile?: {
      name: string;
      location?: string;
    };
  };
}

export function KidDetailsDialog({ open, onOpenChange, kid }: KidDetailsDialogProps) {
  // Fetch kid with parent info if available
  const { data: kidData, isLoading } = useApiQuery<KidWithParent>(
    ['kids', kid._id || kid.id || ''],
    () => {
      const kidId = kid._id || kid.id;
      if (!kidId) {
        throw new Error('Kid ID is required');
      }
      return kidsService.getKidById(kidId);
    },
    {
      enabled: open && !!(kid._id || kid.id),
    }
  );

  const displayKid = (kidData as KidWithParent) || kid;
  const parent = displayKid.parent;
  const initials = kid.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate age from birth date
  const calculateAge = (birthDate: Date | string): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = kid.birthDate ? calculateAge(kid.birthDate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{kid.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{kid.gender}</Badge>
                  {age !== null && (
                    <span className="text-sm text-muted-foreground">{age} years old</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Born {formatDate(kid.birthDate)}
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
                    <p className="font-medium text-sm">{kid.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Kid Account</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Parent Contact Section */}
              {parent && (
                <>
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-sm">Parent</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {parent.parentProfile?.name || 'N/A'}
                        </span>
                      </div>
                      {parent.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{parent.email}</span>
                        </div>
                      )}
                      {parent.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{parent.phone}</span>
                        </div>
                      )}
                      {parent.parentProfile?.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {parent.parentProfile.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />
                </>
              )}

              {/* Highlights Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Session Type</span>
                    <span className="text-muted-foreground">
                      {formatSessionType(kid.sessionType)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Sports</span>
                    <span className="text-muted-foreground">
                      {kid.currentlyInSports ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Medical Conditions</span>
                      <span className="text-muted-foreground">{kid.medicalConditions.length}</span>
                    </div>
                  )}
                  {kid.achievements && kid.achievements.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Achievements</span>
                      <span className="text-muted-foreground">{kid.achievements.length}</span>
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
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="achievements">
                      Achievements {kid.achievements && kid.achievements.length > 0 && `(${kid.achievements.length})`}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* About Section */}
                    <div>
                      <h3 className="font-semibold mb-3">About</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                          <p className="text-sm">{kid.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Gender</h4>
                          <p className="text-sm">{kid.gender}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Birth Date
                          </h4>
                          <p className="text-sm">{formatDate(kid.birthDate)}</p>
                        </div>
                        {age !== null && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Age</h4>
                            <p className="text-sm">{age} years old</p>
                          </div>
                        )}
                        {kid.goal && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Goal</h4>
                            <p className="text-sm">{kid.goal}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Session Type
                          </h4>
                          <p className="text-sm">{formatSessionType(kid.sessionType)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Currently in Sports
                          </h4>
                          <p className="text-sm">{kid.currentlyInSports ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    {kid.medicalConditions && kid.medicalConditions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Medical Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                          {kid.medicalConditions.map((condition, index) => (
                            <Badge key={index} variant="secondary">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sessions" className="mt-6">
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Sessions will be displayed here</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements" className="mt-6">
                    {kid.achievements && kid.achievements.length > 0 ? (
                      <div className="space-y-4">
                        {kid.achievements.map((achievement, index) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{achievement}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No achievements yet</p>
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
