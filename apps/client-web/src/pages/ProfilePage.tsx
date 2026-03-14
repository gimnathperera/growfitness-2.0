import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { googleCalendarService } from '@/services/google-calendar.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  User,
  Mail,
  Lock,
  Calendar,
  Loader2,
  Save,
  MapPin,
  Building2,
  Briefcase,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';

import type {
  UpdateParentDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { useAuth } from '@/contexts/useAuth';
import type { CoachProfileAvailableTime } from '@grow-fitness/shared-types';

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  homeAddress?: string;
  photoUrl?: string;
  availableTimes?: CoachProfileAvailableTime[];
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [coachData, setCoachData] = useState<Awaited<ReturnType<typeof usersService.getCoachById>> | null>(null);

  const isGmail = Boolean(
    user?.email && /@(gmail|googlemail)\.com$/i.test(user.email)
  );

  /**
   * Fetch profile (UPDATE ONLY)
   */
  useEffect(() => {
    if (!user?.id || !user?.role) return;

    const fetchProfile = async () => {
      try {
        if (user.role === 'PARENT') {
          const data = await usersService.getParentById(user.id);
          const nameParts = data.parentProfile?.name?.split(' ') || [];

          setForm({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: data.phone || '',
            address: data.parentProfile?.location || '',
          });
        }

        if (user.role === 'COACH') {
          const data = await usersService.getCoachById(user.id);
          setCoachData(data);
          const nameParts = data.coachProfile?.name?.split(' ') || [];

          setForm({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: data.phone || '',
            homeAddress: data.coachProfile?.homeAddress ?? '',
            photoUrl: data.coachProfile?.photoUrl ?? '',
            availableTimes:
              data.coachProfile?.availableTimes?.map((t) => ({
                dayOfWeek: t.dayOfWeek,
                startTime: t.startTime,
                endTime: t.endTime,
              })) ?? [],
          });
        } else {
          setCoachData(null);
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user?.id || !isGmail) return;

    let active = true;
    const load = async () => {
      setCalendarLoading(true);
      try {
        const status = await googleCalendarService.getStatus();
        if (active) setCalendarConnected(status.connected);
      } catch {
        if (active) setCalendarConnected(false);
      } finally {
        if (active) setCalendarLoading(false);
      }
    };

    void load();

    const url = new URL(window.location.href);
    if (url.searchParams.has('connected') || url.searchParams.has('error')) {
      url.searchParams.delete('connected');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }

    return () => {
      active = false;
    };
  }, [user?.id, isGmail]);

  /**
   * Input handler
   */
  const onChange = (key: keyof FormState, value: string | CoachProfileAvailableTime[] | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addAvailableSlot = () => {
    setForm((prev) => ({
      ...prev,
      availableTimes: [...(prev.availableTimes ?? []), { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
    }));
  };

  const removeAvailableSlot = (index: number) => {
    setForm((prev) => ({
      ...prev,
      availableTimes: prev.availableTimes?.filter((_, i) => i !== index) ?? [],
    }));
  };

  const updateAvailableSlot = (index: number, field: keyof CoachProfileAvailableTime, value: string) => {
    setForm((prev) => {
      const list = [...(prev.availableTimes ?? [])];
      if (!list[index]) return prev;
      list[index] = { ...list[index], [field]: value };
      return { ...prev, availableTimes: list };
    });
  };

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  /**
   * UPDATE ONLY
   */
  const onSubmit = async () => {
    if (!user?.id || !user?.role) return;

    setSaving(true);

    try {
      if (user.role === 'PARENT') {
        const dto: UpdateParentDto = {
          phone: form.phone,
          name: `${form.firstName} ${form.lastName}`.trim(),
          location: form.address,
        };
        await usersService.updateParent(user.id, dto);
      }

      if (user.role === 'COACH') {
        const dto: UpdateCoachDto = {
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          homeAddress: form.homeAddress || undefined,
          photoUrl: form.photoUrl || undefined,
          availableTimes:
            form.availableTimes && form.availableTimes.length > 0
              ? form.availableTimes
              : undefined,
        };
        const updated = await usersService.updateCoach(user.id, dto);
        setCoachData(updated);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const onConnectGoogleCalendar = async () => {
    setCalendarBusy(true);
    try {
      const redirectUri = new URL(window.location.href);
      redirectUri.searchParams.delete('connected');
      redirectUri.searchParams.delete('error');
      const { url } = await googleCalendarService.getAuthUrl(redirectUri.toString());
      window.location.href = url;
    } finally {
      setCalendarBusy(false);
    }
  };

  const onDisconnectGoogleCalendar = async () => {
    setCalendarBusy(true);
    try {
      await googleCalendarService.disconnect();
      const status = await googleCalendarService.getStatus();
      setCalendarConnected(status.connected);
    } finally {
      setCalendarBusy(false);
    }
  };

  /**
   * UI states
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please log in
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mx-12 mt-24">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="text-start space-y-1">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Account & contact details
                </CardDescription>
              </div>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Read-only */}
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
                  <User className="h-4 w-4" /> Status
                </Label>
                <Input disabled value={user.status ?? "ACTIVE"} />
              </div>
            </div>

            {/* Editable */}
            <div className="border-t pt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => onChange('firstName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => onChange('lastName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                />
              </div>

              {user.role === 'PARENT' && (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => onChange('address', e.target.value)}
                  />
                </div>
              )}

              {user.role === 'COACH' && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Home address
                    </Label>
                    <Textarea
                      rows={2}
                      value={form.homeAddress ?? ''}
                      onChange={(e) => onChange('homeAddress', e.target.value)}
                      placeholder="Full address"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Photo URL</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={form.photoUrl ?? ''}
                      onChange={(e) => onChange('photoUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Available times</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addAvailableSlot}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add slot
                      </Button>
                    </div>
                    {(form.availableTimes ?? []).map((slot, index) => (
                      <div key={index} className="flex gap-2 items-center flex-wrap">
                        <select
                          className="flex h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                          value={slot.dayOfWeek}
                          onChange={(e) => updateAvailableSlot(index, 'dayOfWeek', e.target.value)}
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="time"
                          className="w-28"
                          value={slot.startTime}
                          onChange={(e) => updateAvailableSlot(index, 'startTime', e.target.value)}
                        />
                        <Input
                          type="time"
                          className="w-28"
                          value={slot.endTime}
                          onChange={(e) => updateAvailableSlot(index, 'endTime', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAvailableSlot(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user.role === 'COACH' && coachData?.coachProfile && (
              <div className="border-t pt-6 grid gap-4 md:grid-cols-2">
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

            <Button
              onClick={onSubmit}
              disabled={saving}
              className="w-full h-12"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Profile
                </>
              )}
            </Button>
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
                      {calendarLoading
                        ? 'Checking…'
                        : calendarConnected
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
                  onClick={onConnectGoogleCalendar}
                  disabled={calendarLoading || calendarBusy}
                  className="sm:w-auto"
                >
                  {calendarConnected ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={onDisconnectGoogleCalendar}
                  disabled={!calendarConnected || calendarLoading || calendarBusy}
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
