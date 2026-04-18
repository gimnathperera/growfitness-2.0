import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { googleCalendarService } from '@/services/google-calendar.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  User,
  Mail,
  Lock,
  Calendar,
  Loader2,
  MapPin,
  Building2,
  Briefcase,
  FileText,
} from 'lucide-react';

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
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [coachData, setCoachData] = useState<Awaited<
    ReturnType<typeof usersService.getCoachById>
  > | null>(null);

  const isGmail = Boolean(user?.email && /@(gmail|googlemail)\.com$/i.test(user.email));

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
              data.coachProfile?.availableTimes?.map(t => ({
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

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

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
    return <div className="min-h-screen flex items-center justify-center">Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-20 sm:px-6 sm:pt-24 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="text-start space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Your Profile</h1>
          <p className="text-muted-foreground">View your personal information</p>
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
                <Input disabled value={user.status ?? 'ACTIVE'} />
              </div>
            </div>

            {/* Editable */}
            <div className="border-t pt-6 grid gap-4 md:grid-cols-2">
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

              {user.role === 'PARENT' && (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={form.address} disabled />
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
                      placeholder="Full address"
                      disabled
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Photo URL</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={form.photoUrl ?? ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Available times</Label>
                    </div>
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
