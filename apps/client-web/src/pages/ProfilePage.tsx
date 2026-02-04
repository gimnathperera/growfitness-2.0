import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Phone,
  MapPin,
  Award,
  Lock,
  Loader2,
  Save,
} from 'lucide-react';

import type {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';

type FormState = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  specialization?: string;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [form, setForm] = useState<FormState>({});

  /**
   * Fetch profile
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
        } else {
          const data = await usersService.getCoachById(user.id);

          const coachNameParts = data.coachProfile?.name?.split(' ') || [];
          
          setForm({
            firstName: coachNameParts[0] || '',
            lastName: coachNameParts.slice(1).join(' ') || '',
            phone: data.phone || '',
            specialization: data.specialization || '',
          });
        }

        setProfileExists(true);
      } catch {
        setProfileExists(false);
        setForm({});
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  /**
   * Input handler
   */
  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Submit
   */
  const onSubmit = async () => {
    if (!user?.id || !user?.role) return;

    setSaving(true);

    try {
      if (profileExists) {
        // UPDATE
        if (user.role === 'PARENT') {
          const dto: UpdateParentDto = {
            phone: form.phone,
            parentProfile: {
              name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
              location: form.address,
            },
          };

          await usersService.updateParent(user.id, dto);
        } else {
          const dto: UpdateCoachDto = {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            specialization: form.specialization,
          };

          await usersService.updateCoach(user.id, dto);
        }
      } else {
        // CREATE
        if (user.role === 'PARENT') {
          const dto: CreateParentDto = {
            userId: user.id,
            phone: form.phone,
            parentProfile: {
              name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
              location: form.address,
            },
          };

          await usersService.createParent(dto);
        } else {
          const dto: CreateCoachDto = {
            userId: user.id,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            specialization: form.specialization,
          };

          await usersService.createCoach(dto);
        }

        setProfileExists(true);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * UI states
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">
            {profileExists ? 'Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information
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
                <Input disabled value={user.status} />
              </div>
            </div>

            {/* Editable */}
            <div className="border-t pt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label><User className="inline h-4 w-4 mr-1" /> First Name</Label>
                <Input
                  value={form.firstName || ''}
                  onChange={(e) => onChange('firstName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label><User className="inline h-4 w-4 mr-1" /> Last Name</Label>
                <Input
                  value={form.lastName || ''}
                  onChange={(e) => onChange('lastName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label><Phone className="inline h-4 w-4 mr-1" /> Phone</Label>
                <Input
                  value={form.phone || ''}
                  onChange={(e) => onChange('phone', e.target.value)}
                />
              </div>

              {user.role === 'PARENT' && (
                <div className="space-y-2">
                  <Label><MapPin className="inline h-4 w-4 mr-1" /> Address</Label>
                  <Input
                    value={form.address || ''}
                    onChange={(e) => onChange('address', e.target.value)}
                  />
                </div>
              )}

              {user.role === 'COACH' && (
                <div className="space-y-2">
                  <Label><Award className="inline h-4 w-4 mr-1" /> Specialization</Label>
                  <Input
                    value={form.specialization || ''}
                    onChange={(e) =>
                      onChange('specialization', e.target.value)
                    }
                  />
                </div>
              )}
            </div>

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
                  {profileExists ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
