import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  formatDate, formatDateTime, formatEmploymentType, formatSessionType,
} from '@/lib/formatters';
import { User, Kid, Session } from '@grow-fitness/shared-types';
import { useApiQuery } from '@/hooks/useApiQuery';
import { usersService } from '@/services/users.service';
import { sessionsService } from '@/services/sessions.service';
import { useModalParams } from '@/hooks/useModalParams';
import {
  Mail, Phone, MapPin, Calendar, Baby, Target, Activity,
  Award, AlertCircle, FileText, Briefcase, GraduationCap, Clock, User as UserIcon,
} from 'lucide-react';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}
interface ParentWithKids extends User { kids?: Kid[] }

export function UserDetailsDialog({ open, onOpenChange, user: userProp }: UserDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('userId');

  const { data: userFromUrl } = useApiQuery(
    ['users', entityId || 'no-id'],
    () => {
      if (!entityId) throw new Error('User ID is required');
      return usersService.getParentById(entityId).catch(() => usersService.getCoachById(entityId));
    },
    { enabled: open && !userProp && !!entityId },
  );

  const user = userProp || userFromUrl;
  const isParent = !!user?.parentProfile;
  const isCoach = !!user?.coachProfile;
  const userId = user?.id || entityId;

  const { data: parentData, isLoading: isLoadingParent } = useApiQuery(
    ['users', 'parents', userId || 'no-id'],
    () => { if (!userId) throw new Error('User ID is required'); return usersService.getParentById(userId); },
    { enabled: isParent && open && !!userId },
  );
  const { data: coachData, isLoading: isLoadingCoach } = useApiQuery(
    ['users', 'coaches', userId || 'no-id'],
    () => { if (!userId) throw new Error('User ID is required'); return usersService.getCoachById(userId); },
    { enabled: isCoach && open && !!userId },
  );
  const { data: coachSessionsData, isLoading: isLoadingCoachSessions } = useApiQuery(
    ['sessions', 'coach', userId || 'no-id'],
    () => {
      if (!userId) throw new Error('User ID is required');
      return sessionsService.getSessions(1, 100, { coachId: userId, sortBy: 'dateTime', sortOrder: 'desc' });
    },
    { enabled: isCoach && open && !!userId },
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) closeModal();
    onOpenChange(newOpen);
  };

  if (!user) return null;

  const displayUser = parentData || coachData || user;
  const kids = (displayUser as ParentWithKids).kids || [];
  const userName = isParent ? displayUser.parentProfile?.name
    : isCoach ? displayUser.coachProfile?.name : 'N/A';
  const coachProfile = isCoach ? displayUser.coachProfile : undefined;
  const parentProfile = isParent ? displayUser.parentProfile : undefined;
  const photoUrl = isCoach ? coachProfile?.photoUrl : parentProfile?.photoUrl;

  const initials = (userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isLoading = isLoadingParent || isLoadingCoach;

  const emptyLabel = '—';
  const fmt = (v: string | null | undefined) =>
    v != null && String(v).trim() !== '' ? String(v).trim() : emptyLabel;
  const fmtDate = (v: Date | string | null | undefined) =>
    v != null ? formatDate(typeof v === 'string' ? v : v) : emptyLabel;

  const totalKids = kids.length;
  const coachSessions = (coachSessionsData?.data || []) as Session[];
  const totalCoachSessions = coachSessionsData?.total || coachSessions.length;

  const Field = ({ icon: Icon, label, children }: { icon?: any; label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden gap-0">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-background px-8 pt-8 pb-6 border-b">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
              {photoUrl && <AvatarImage src={photoUrl} alt={userName || ''} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-semibold tracking-tight">{userName}</h2>
                <StatusBadge status={displayUser.status} />
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />{displayUser.email}
                </span>
                {displayUser.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />{displayUser.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />Joined {formatDate(displayUser.createdAt)}
                </span>
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="font-normal">
                  {isCoach ? 'Coach Account' : isParent ? 'Parent Account' : 'User'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
            {/* Sidebar */}
            <aside className="border-r bg-muted/30 p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-all">{displayUser.email}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{fmt(displayUser.phone)}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{fmt(isCoach ? coachProfile?.homeAddress : parentProfile?.location)}</span>
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Highlights</h3>
                <div className="grid grid-cols-2 gap-2">
                  {isParent && (
                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-xs text-muted-foreground">Kids</div>
                      <div className="text-xl font-semibold mt-0.5">{totalKids}</div>
                    </div>
                  )}
                  {isCoach && (
                    <>
                      <div className="rounded-lg border bg-background p-3">
                        <div className="text-xs text-muted-foreground">Sessions</div>
                        <div className="text-xl font-semibold mt-0.5">{totalCoachSessions}</div>
                      </div>
                      <div className="rounded-lg border bg-background p-3 col-span-2">
                        <div className="text-xs text-muted-foreground">Employment</div>
                        <div className="text-sm font-medium mt-0.5">{formatEmploymentType(coachProfile?.employmentType)}</div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </aside>

            {/* Main */}
            <main className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
              ) : (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {!isCoach && <TabsTrigger value="kids">Kids {totalKids > 0 && `(${totalKids})`}</TabsTrigger>}
                    {isCoach && <TabsTrigger value="sessions">Sessions {totalCoachSessions > 0 && `(${totalCoachSessions})`}</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">About</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                          <Field icon={UserIcon} label="Name">{fmt(userName)}</Field>
                          <Field icon={Mail} label="Email">{displayUser.email}</Field>
                          <Field icon={Phone} label="Phone">{fmt(displayUser.phone)}</Field>
                          {isCoach && <Field icon={Calendar} label="Date of birth">{fmtDate(coachProfile?.dateOfBirth as any)}</Field>}
                          <Field icon={MapPin} label={isCoach ? 'Home address' : 'Address'}>
                            {fmt(isCoach ? coachProfile?.homeAddress : parentProfile?.location)}
                          </Field>
                          {isCoach && <Field icon={GraduationCap} label="School">{fmt(coachProfile?.school)}</Field>}
                          {isCoach && <Field icon={Briefcase} label="Employment">{formatEmploymentType(coachProfile?.employmentType)}</Field>}
                          <Field label="Status"><StatusBadge status={displayUser.status} /></Field>
                          <Field icon={Calendar} label="Member since">{formatDate(displayUser.createdAt)}</Field>
                        </div>

                        {isCoach && (
                          <>
                            <Separator className="my-6" />
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />Available times
                              </h4>
                              {coachProfile?.availableTimes?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {coachProfile.availableTimes.map((slot, i) => (
                                    <Badge key={i} variant="secondary" className="font-normal">
                                      {slot.dayOfWeek} · {slot.startTime}–{slot.endTime}
                                    </Badge>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
                            </div>

                            <Separator className="my-6" />
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />CV
                              </h4>
                              {coachProfile?.cvUrl ? (
                                <Button asChild variant="outline" size="sm">
                                  <a href={coachProfile.cvUrl} target="_blank" rel="noreferrer">
                                    <FileText className="h-4 w-4 mr-2" />View CV
                                  </a>
                                </Button>
                              ) : <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {!isCoach && (
                    <TabsContent value="kids" className="mt-4">
                      {totalKids === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Baby className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">No children registered yet</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {kids.map(kid => (
                            <Card key={kid.id}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Baby className="h-4 w-4 text-primary" />{kid.name}
                                  </CardTitle>
                                  <Badge variant="outline" className="font-normal">{kid.gender}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <Field label="Birth date">{formatDate(kid.birthDate)}</Field>
                                  <Field label="Session type">{formatSessionType(kid.sessionType)}</Field>
                                </div>
                                {kid.goal && (
                                  <div className="rounded-md bg-muted/50 p-3 flex gap-2">
                                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                      <div className="text-xs font-medium text-muted-foreground">Goal</div>
                                      <div className="text-sm">{kid.goal}</div>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <span>{kid.currentlyInSports ? 'In sports' : 'Not in sports'}</span>
                                </div>
                                {kid.medicalConditions?.length ? (
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                                    <div className="space-y-1.5">
                                      <div className="text-xs font-medium text-muted-foreground">Medical conditions</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {kid.medicalConditions.map((c, i) => (
                                          <Badge key={i} variant="destructive" className="font-normal">{c}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                {kid.achievements?.length ? (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span>{kid.achievements.length} achievement(s)</span>
                                  </div>
                                ) : null}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  )}

                  {isCoach && (
                    <TabsContent value="sessions" className="mt-4">
                      {isLoadingCoachSessions ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">Loading sessions…</div>
                      ) : coachSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">No sessions assigned yet</p>
                        </div>
                      ) : (
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Session</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Kids</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coachSessions.map(session => (
                                <TableRow key={session.id}>
                                  <TableCell className="font-medium">
                                    {session.title || `${formatSessionType(session.type)} Session`}
                                  </TableCell>
                                  <TableCell>{formatDateTime(session.dateTime)}</TableCell>
                                  <TableCell>{formatSessionType(session.type)}</TableCell>
                                  <TableCell><StatusBadge status={session.status} /></TableCell>
                                  <TableCell>{session.location?.name || emptyLabel}</TableCell>
                                  <TableCell className="text-right">{session.kids?.length ?? (session.kidId ? 1 : 0)}</TableCell>
                                  <TableCell className="text-right">{session.duration} min</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </main>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
