import { useEffect, useState } from 'react';
import { profileService } from '@/services/profile.service';
import { uploadFileViaGcs } from '@/services/uploads.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FieldError } from '@/components/common/FieldError';
import { ProfilePhotoEditor } from '@/components/common/ProfilePhotoEditor';
import {
  parseParentProfileForm,
  zodFieldErrorMap,
} from '@/lib/profile-form-schemas';
import { resolveCoachPhotoUrl } from '@/lib/coach-profile';
import {
  User as UserIcon,
  Mail,
  Lock,
  Calendar,
  Loader2,
  MapPin,
  Building2,
  Briefcase,
  FileText,
  Save,
} from 'lucide-react';

import { useAuth } from '@/contexts/useAuth';
import { useParentProfile } from '@/contexts/parent-profile/ParentProfileProvider';
import { useCoachProfile } from '@/contexts/coach-profile/CoachProfileProvider';
import { ReadOnlyProfilePhoto } from '@/components/common/ReadOnlyProfilePhoto';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import { isGmailAccount } from '@/lib/google-calendar';
import type { CoachProfileAvailableTime, User } from '@grow-fitness/shared-types';
import { UploadKind } from '@grow-fitness/shared-types';

type ParentFieldKey = 'firstName' | 'phone' | 'address';

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  parentPhotoUrl?: string;
  homeAddress?: string;
  photoUrl?: string;
  availableTimes?: CoachProfileAvailableTime[];
};

export default function ProfilePage() {
  const { user } = useAuth();
  const parentCtx = useParentProfile();
  const coachCtx = useCoachProfile();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    parentPhotoUrl: '',
  });
  const [coachData, setCoachData] = useState<User | null>(null);

  const [savingParent, setSavingParent] = useState(false);
  const [uploadingParentPhoto, setUploadingParentPhoto] = useState(false);
  const [parentPhotoFile, setParentPhotoFile] = useState<File | null>(null);
  const [parentPhotoRemoved, setParentPhotoRemoved] = useState(false);
  const [parentFieldErrors, setParentFieldErrors] = useState<
    Partial<Record<ParentFieldKey, string>>
  >({});

  const isGmail = isGmailAccount(user?.email);
  const calendarSync = useGoogleCalendarSync({ enabled: isGmail });

  useEffect(() => {
    if (!user?.id || user.role !== 'PARENT') return;

    if (parentCtx.isLoading) return;

    const data = parentCtx.profile;
    if (!data) {
      setLoading(false);
      return;
    }

    const nameParts = data.parentProfile?.name?.split(' ') || [];

    setForm(prev => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phone || '',
      address: data.parentProfile?.location || '',
      parentPhotoUrl: data.parentProfile?.photoUrl || '',
    }));
    setParentPhotoFile(null);
    setParentPhotoRemoved(false);
    setParentFieldErrors({});
    setLoading(false);
  }, [user?.id, user?.role, parentCtx.isLoading, parentCtx.profile]);

  useEffect(() => {
    if (!user?.id || user.role !== 'COACH') return;

    if (coachCtx.isLoading) return;

    const data = coachCtx.profile;
    if (!data) {
      setLoading(false);
      return;
    }

    setCoachData(data);
    const nameParts = data.coachProfile?.name?.split(' ') || [];

    setForm({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phone || '',
      homeAddress: data.coachProfile?.homeAddress ?? '',
      photoUrl: data.coachProfile?.photoUrl ?? '',
      availableTimes:
        data.coachProfile?.availableTimes?.map(t => ({
          dayOfWeek: t.dayOfWeek,
          startTime: t.startTime,
          endTime: t.endTime,
        })) ?? [],
    });
    setLoading(false);
  }, [user?.id, user?.role, coachCtx.isLoading, coachCtx.profile]);

  useEffect(() => {
    if (!calendarSync.oauthResult) return;

    if (calendarSync.oauthResult === 'success') {
      toast({
        variant: 'success',
        title: 'Google Calendar connected',
        description: 'Your sessions will sync to Google Calendar automatically.',
      });
    } else {
      toast({
        title: 'Could not connect Google Calendar',
        description: 'Please try again or use a Google account that granted calendar access.',
        variant: 'destructive',
      });
    }
    calendarSync.clearOAuthResult();
  }, [calendarSync.oauthResult, calendarSync.clearOAuthResult, toast]);

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || user.role !== 'PARENT') return;

    const parsed = parseParentProfileForm({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      address: form.address ?? '',
    });

    if (!parsed.success) {
      setParentFieldErrors(zodFieldErrorMap(parsed.error.issues) as Partial<Record<ParentFieldKey, string>>);
      return;
    }
    setParentFieldErrors({});

    try {
      setSavingParent(true);

      if (parentPhotoFile) {
        try {
          setUploadingParentPhoto(true);
          await uploadFileViaGcs(UploadKind.PARENT_AVATAR, user.id, parentPhotoFile);
        } catch (error) {
          toast({
            title: 'Upload failed',
            description:
              error instanceof Error ? error.message : 'Could not upload profile picture.',
            variant: 'destructive',
          });
          return;
        } finally {
          setUploadingParentPhoto(false);
        }
      }

      const fullName = [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(' ');

      await profileService.updateMyProfile({
        name: fullName,
        phone: parsed.data.phone,
        location: parsed.data.address || undefined,
        ...(parentPhotoRemoved && !parentPhotoFile ? { photoUrl: '' } : {}),
      });

      setParentPhotoFile(null);
      setParentPhotoRemoved(false);
      await parentCtx.refresh();

      toast({
        variant: 'success',
        title: 'Profile saved',
        description: 'Your details were updated. Changes appear everywhere your account is shown.',
      });
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not save profile.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSavingParent(false);
    }
  };

  const parentStatus =
    parentCtx.profile?.status ?? user?.status ?? 'ACTIVE';

  const coachProfileLoading = user?.role === 'COACH' && coachCtx.isLoading;

  if (loading || coachProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-20 sm:px-6 sm:pt-24 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-start space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Your Profile</h1>
          <p className="text-muted-foreground">
            {user.role === 'PARENT'
              ? 'Update your personal information'
              : 'View your personal information'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Account & contact details</CardDescription>
              </div>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <div className="relative">
                  <Input disabled value={user.email} />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" /> Status
                </Label>
                <Input
                  disabled
                  value={user.role === 'PARENT' ? parentStatus : (user.status ?? 'ACTIVE')}
                />
              </div>
            </div>

            {user.role === 'PARENT' ? (
              <form
                noValidate
                onSubmit={handleParentSubmit}
                className="space-y-6 border-t pt-6"
              >
                <ProfilePhotoEditor
                  savedPhotoUrl={form.parentPhotoUrl}
                  pendingFile={parentPhotoFile}
                  onPendingFileChange={setParentPhotoFile}
                  photoRemoved={parentPhotoRemoved}
                  onPhotoRemovedChange={setParentPhotoRemoved}
                  fallbackLabel={form.firstName || user.email || '?'}
                  disabled={savingParent}
                  uploading={uploadingParentPhoto}
                  helperText="The selected photo uploads when you save changes."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parent-firstName">First Name</Label>
                    <Input
                      id="parent-firstName"
                      value={form.firstName}
                      onChange={e => {
                        setForm(prev => ({ ...prev, firstName: e.target.value }));
                        setParentFieldErrors(prev => ({ ...prev, firstName: undefined }));
                      }}
                      disabled={savingParent}
                      autoComplete="given-name"
                      aria-invalid={Boolean(parentFieldErrors.firstName)}
                      aria-describedby={
                        parentFieldErrors.firstName ? 'parent-firstName-error' : undefined
                      }
                      className={parentFieldErrors.firstName ? 'border-destructive' : undefined}
                    />
                    <FieldError
                      id="parent-firstName-error"
                      message={parentFieldErrors.firstName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-lastName">Last Name</Label>
                    <Input
                      id="parent-lastName"
                      value={form.lastName}
                      onChange={e => {
                        setForm(prev => ({ ...prev, lastName: e.target.value }));
                      }}
                      disabled={savingParent}
                      autoComplete="family-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-phone">Phone</Label>
                    <Input
                      id="parent-phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={e => {
                        setForm(prev => ({ ...prev, phone: e.target.value }));
                        setParentFieldErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      disabled={savingParent}
                      autoComplete="tel"
                      aria-invalid={Boolean(parentFieldErrors.phone)}
                      aria-describedby={
                        parentFieldErrors.phone ? 'parent-phone-error' : undefined
                      }
                      className={parentFieldErrors.phone ? 'border-destructive' : undefined}
                    />
                    <FieldError id="parent-phone-error" message={parentFieldErrors.phone} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-address">Address</Label>
                    <Input
                      id="parent-address"
                      value={form.address ?? ''}
                      onChange={e => {
                        setForm(prev => ({ ...prev, address: e.target.value }));
                        setParentFieldErrors(prev => ({ ...prev, address: undefined }));
                      }}
                      disabled={savingParent}
                      autoComplete="street-address"
                      aria-invalid={Boolean(parentFieldErrors.address)}
                      aria-describedby={
                        parentFieldErrors.address ? 'parent-address-error' : undefined
                      }
                      className={parentFieldErrors.address ? 'border-destructive' : undefined}
                    />
                    <FieldError id="parent-address-error" message={parentFieldErrors.address} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingParent || uploadingParentPhoto}>
                    {savingParent || uploadingParentPhoto ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : user.role === 'COACH' ? (
              <div className="space-y-6 border-t pt-6">
                <ReadOnlyProfilePhoto
                  photoUrl={
                    coachCtx.photoUrl ??
                    resolveCoachPhotoUrl(coachData) ??
                    form.photoUrl
                  }
                  displayName={coachCtx.displayName}
                  email={user.email}
                />
                <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={form.firstName} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={form.lastName} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} disabled />
                </div>

                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Home address
                    </Label>
                    <Textarea
                      rows={2}
                      value={form.homeAddress ?? ''}
                      placeholder="Full address"
                      disabled
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Available times</Label>
                    {(form.availableTimes ?? []).map((slot, index) => (
                      <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm sm:w-[160px]"
                          value={slot.dayOfWeek}
                          disabled
                        >
                          {DAYS_OF_WEEK.map(d => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="time"
                          className="w-full sm:w-28"
                          value={slot.startTime}
                          disabled
                        />
                        <Input
                          type="time"
                          className="w-full sm:w-28"
                          value={slot.endTime}
                          disabled
                        />
                      </div>
                    ))}
                  </div>
                </>
                </div>

                {coachData?.coachProfile && (
              <div className="grid gap-4 md:grid-cols-2 border-t pt-6">
                <h4 className="text-sm font-medium col-span-2">Read-only (set by admin)</h4>
                {coachData.coachProfile.dateOfBirth && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date of birth</Label>
                    <Input
                      disabled
                      value={
                        typeof coachData.coachProfile.dateOfBirth === 'string'
                          ? new Date(coachData.coachProfile.dateOfBirth).toLocaleDateString()
                          : (coachData.coachProfile.dateOfBirth as Date).toLocaleDateString()
                      }
                    />
                  </div>
                )}
                {coachData.coachProfile.school && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" /> School
                    </Label>
                    <Input disabled value={coachData.coachProfile.school} />
                  </div>
                )}
                {coachData.coachProfile.employmentType && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" /> Employment type
                    </Label>
                    <Input
                      disabled
                      value={coachData.coachProfile.employmentType.replace(/_/g, ' ')}
                    />
                  </div>
                )}
                {coachData.coachProfile.cvUrl && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" /> CV
                    </Label>
                    <a
                      href={coachData.coachProfile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View CV
                    </a>
                  </div>
                )}
              </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {isGmail && (
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>Sync your sessions to Google Calendar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    Status:{' '}
                    <span className="font-medium">
                      {calendarSync.loading
                        ? 'Checking…'
                        : calendarSync.connected
                          ? 'Connected'
                          : 'Not connected'}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    When connected, your scheduled sessions are pushed to your Google Calendar
                    automatically.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => void calendarSync.connect()}
                  disabled={calendarSync.loading || calendarSync.busy}
                  className="sm:w-auto"
                >
                  {calendarSync.connected ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void calendarSync.disconnect()}
                  disabled={!calendarSync.connected || calendarSync.loading || calendarSync.busy}
                  className="sm:w-auto"
                >
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
