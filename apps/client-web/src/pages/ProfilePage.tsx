import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';


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
  Lock,
  Loader2,
  Save,
} from 'lucide-react';

import type {
  UpdateParentDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { useAuth } from '@/contexts/useAuth';

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

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
          const nameParts = data.coachProfile?.name?.split(' ') || [];

          setForm({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile', error);
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
        };
        await usersService.updateCoach(user.id, dto);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
                <Input disabled value={user.status} />
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
                  Update Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
