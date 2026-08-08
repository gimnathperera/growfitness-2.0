import { StatusBadge } from '@/components/common/StatusBadge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  formatDate, formatEmploymentType, formatSessionType,
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

function CoachColorSwatch({ color }: { color?: string }) {
  if (!color) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="h-5 w-10 rounded-md border border-border shadow-sm"
        style={{ backgroundColor: color }}
        title={`Assigned Color: ${color}`}
      />
      <span className="font-mono text-xs uppercase text-muted-foreground">{color}</span>
    </div>
  );
}

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
  const { data: coachSessionsData } = useApiQuery(
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
      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--gf-green-deep)]" />}
        {label}
      </div>
      <div className="text-sm text-[var(--fg-2)] font-semibold">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[100vw] sm:max-w-5xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] p-0 overflow-hidden gap-0 border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] shadow-[4px_4px_0_0_var(--gf-green-deep)] sm:shadow-2xl rounded-none sm:rounded-2xl flex flex-col">
        <DialogTitle className="sr-only">User Details</DialogTitle>
        <DialogDescription className="sr-only">View detailed information about this user</DialogDescription>
        {/* Gradient header */}
        <div className="relative bg-[var(--gf-green-50)] px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 md:pb-6 border-b-2 border-[var(--gf-green-deep)]/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-[var(--gf-paper)] shadow-[2px_2px_0_0_var(--gf-green-deep)] border-2 border-[var(--gf-green-deep)] flex-shrink-0">
              {photoUrl && <AvatarImage src={photoUrl} alt={userName || ''} />}
              <AvatarFallback className="bg-[var(--gf-green-deep)] text-white text-lg sm:text-xl font-extrabold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>{userName}</h2>
                <StatusBadge status={displayUser.status} />
              </div>
              <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--fg-2)] font-semibold flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--gf-green-deep)]" />{displayUser.email}
                </span>
                {displayUser.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--gf-green-deep)]" />{displayUser.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--gf-green-deep)]" />Joined {formatDate(displayUser.createdAt)}
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <Badge variant="secondary" className="font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] bg-[var(--gf-green-deep)] text-white text-xs sm:text-sm">
                  {isCoach ? 'Coach Account' : isParent ? 'Parent Account' : 'User'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 h-full">
            {/* Sidebar - hidden on mobile, shown on lg */}
            <aside className="hidden lg:flex lg:flex-col border-r border-[var(--gf-green-deep)]/10 bg-[var(--gf-green-50)]/30 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Contact</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 mt-0.5 text-[var(--gf-green-deep)] shrink-0" />
                    <span className="break-all font-semibold">{displayUser.email}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 mt-0.5 text-[var(--gf-green-deep)] shrink-0" />
                    <span className="font-semibold">{fmt(displayUser.phone)}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-[var(--gf-green-deep)] shrink-0" />
                    <span className="font-semibold">{fmt(isCoach ? coachProfile?.homeAddress : parentProfile?.location)}</span>
                  </li>
                </ul>
              </section>

              <Separator className="bg-[var(--gf-green-deep)]/10" />

              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Highlights</h3>
                <div className="grid grid-cols-2 gap-2">
                  {isParent && (
                    <div className="rounded-xl border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] p-3 shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                      <div className="text-xs text-[var(--fg-2)] font-semibold">Kids</div>
                      <div className="text-xl font-extrabold text-[var(--gf-green-deep)] mt-0.5">{totalKids}</div>
                    </div>
                  )}
                  {isCoach && (
                    <>
                      <div className="rounded-xl border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] p-3 shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                        <div className="text-xs text-[var(--fg-2)] font-semibold">Sessions</div>
                        <div className="text-xl font-extrabold text-[var(--gf-green-deep)] mt-0.5">{totalCoachSessions}</div>
                      </div>
                      <div className="rounded-xl border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] p-3 col-span-2 shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                        <div className="text-xs text-[var(--fg-2)] font-semibold">Employment</div>
                        <div className="text-sm font-extrabold text-[var(--gf-green-deep)] mt-0.5">{formatEmploymentType(coachProfile?.employmentType)}</div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
              ) : (
                <Tabs defaultValue="overview" className="w-full flex flex-col">
                  <TabsList className="bg-[var(--gf-green-50)]/30 h-10 grid grid-cols-2 lg:grid-cols-1 lg:flex w-full lg:w-auto gap-2">
                    <TabsTrigger value="overview" className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-[var(--gf-green-deep)] data-[state=active]:bg-[var(--gf-green-deep)] data-[state=active]:text-white border-2 border-[var(--gf-green-deep)]">Overview</TabsTrigger>
                    {!isCoach && <TabsTrigger value="kids" className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-[var(--gf-green-deep)] data-[state=active]:bg-[var(--gf-green-deep)] data-[state=active]:text-white border-2 border-[var(--gf-green-deep)]">Kids {totalKids > 0 && `(${totalKids})`}</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="overview" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                    <Card className="border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] shadow-[2px_2px_0_0_var(--gf-green-deep)] rounded-xl sm:rounded-2xl">
                      <CardHeader className="pb-2 sm:pb-3"><CardTitle className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>About</CardTitle></CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-5">
                          <Field icon={UserIcon} label="Name">
                            {fmt(userName)}
                          </Field>
                          <Field icon={Mail} label="Email">{displayUser.email}</Field>
                          <Field icon={Phone} label="Phone">{fmt(displayUser.phone)}</Field>
                          {isCoach && <Field icon={Calendar} label="Date of birth">{fmtDate(coachProfile?.dateOfBirth as any)}</Field>}
                          <Field icon={MapPin} label={isCoach ? 'Home address' : 'Address'}>
                            {fmt(isCoach ? coachProfile?.homeAddress : parentProfile?.location)}
                          </Field>
                          {isCoach && <Field icon={GraduationCap} label="School">{fmt(coachProfile?.school)}</Field>}
                          {isCoach && <Field icon={Briefcase} label="Employment">{formatEmploymentType(coachProfile?.employmentType)}</Field>}
                          {isCoach && (
                            <Field label="Assigned color">
                              <CoachColorSwatch color={coachProfile?.assignedColor} />
                            </Field>
                          )}
                          <Field label="Status"><StatusBadge status={displayUser.status} /></Field>
                          <Field icon={Calendar} label="Member since">{formatDate(displayUser.createdAt)}</Field>
                        </div>

                        {isCoach && (
                          <>
                            <Separator className="my-6" />
                            <div className="space-y-3">
                              <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                <Clock className="h-4 w-4 text-[var(--gf-green-deep)]" />Available times
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
                              <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                <FileText className="h-4 w-4 text-[var(--gf-green-deep)]" />CV
                              </h4>
                              {coachProfile?.cvUrl ? (
                                <Button asChild variant="outline" size="sm" className="rounded-xl px-4 py-2 text-sm text-[var(--gf-green-deep)] font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] hover:bg-[var(--gf-green-50)] transition-all duration-200">
                                  <a href={coachProfile.cvUrl} target="_blank" rel="noreferrer">
                                    <FileText className="h-4 w-4 mr-2" />View CV
                                  </a>
                                </Button>
                              ) : <p className="text-sm text-[var(--fg-2)] font-semibold">{emptyLabel}</p>}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {!isCoach && (
                    <TabsContent value="kids" className="flex-1 min-h-0 overflow-y-auto mt-3 sm:mt-4">
                      {totalKids === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center">
                          <Baby className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--gf-green-deep)] mb-2 sm:mb-3" />
                          <p className="text-xs sm:text-sm text-[var(--fg-2)] font-semibold">No children registered yet</p>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                          {kids.map(kid => (
                            <Card key={kid.id} className="border-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-paper)] shadow-[2px_2px_0_0_var(--gf-green-deep)]">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Baby className="h-4 w-4 text-[var(--gf-green-deep)]" />{kid.name}
                                  </CardTitle>
                                  <Badge variant="outline" className="font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] text-[var(--gf-green-deep)]">{kid.gender}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <Field label="Birth date">{formatDate(kid.birthDate)}</Field>
                                  <Field label="Session type">{formatSessionType(kid.sessionType)}</Field>
                                </div>
                                {kid.goal && (
                                  <div className="rounded-xl bg-[var(--gf-green-50)]/50 p-3 flex gap-2 border-2 border-[var(--gf-green-deep)]/30">
                                    <Target className="h-4 w-4 text-[var(--gf-green-deep)] mt-0.5 shrink-0" />
                                    <div>
                                      <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Goal</div>
                                      <div className="text-sm font-semibold">{kid.goal}</div>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Activity className="h-4 w-4 text-[var(--gf-green-deep)]" />
                                  <span>{kid.currentlyInSports ? 'In sports' : 'Not in sports'}</span>
                                </div>
                                {kid.medicalConditions?.length ? (
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                    <div className="space-y-1.5">
                                      <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Conditions</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {kid.medicalConditions.map((c, i) => (
                                          <Badge key={i} variant="destructive" className="font-extrabold uppercase tracking-wider">{c}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                {kid.achievements?.length ? (
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Award className="h-4 w-4 text-[var(--gf-green-deep)]" />
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

                  {/* {isCoach && (
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
                  )} */}
                </Tabs>
              )}
            </main>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
