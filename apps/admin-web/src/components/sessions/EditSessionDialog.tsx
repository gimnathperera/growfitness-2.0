import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { UpdateSessionSchema, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { Session, SessionStatus, SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
}

// Helper to extract ID from populated object or string
function extractId(value: string | { id?: string } | any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.id) return value.id;
  return '';
}

export function EditSessionDialog({
  open,
  onOpenChange,
  session: sessionProp,
}: EditSessionDialogProps) {
  const { toast } = useToast();
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

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!session) {
    return null;
  }

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );

  const { data: kidsData } = useApiQuery(['kids', 'all'], () => kidsService.getKids(1, 100));

  // Helper to get date value for DateTimePicker
  const getDateValue = (date: Date | string | null | undefined): Date | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return date;
  };

  const form = useForm<UpdateSessionDto>({
    resolver: zodResolver(UpdateSessionSchema),
    defaultValues: {
      coachId: extractId(session.coachId),
      locationId: extractId(session.locationId),
      dateTime: getDateValue(session.dateTime),
      duration: session.duration,
      capacity: session.capacity,
      status: session.status,
      kids: Array.isArray(session.kids)
        ? session.kids.map((kid: any) => extractId(kid))
        : undefined,
      kidId: session.kidId ? extractId(session.kidId) : undefined,
      isFreeSession: session.isFreeSession,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        coachId: extractId(session.coachId),
        locationId: extractId(session.locationId),
        dateTime: getDateValue(session.dateTime),
        duration: session.duration,
        capacity: session.capacity,
        status: session.status,
        kids: Array.isArray(session.kids)
          ? session.kids.map((kid: any) => extractId(kid))
          : undefined,
        kidId: session.kidId ? extractId(session.kidId) : undefined,
        isFreeSession: session.isFreeSession,
      });
    }
  }, [open, session, form]);

  const updateMutation = useApiMutation(
    (data: UpdateSessionDto) => sessionsService.updateSession(session.id, data),
    {
      invalidateQueries: [['sessions']],
      onSuccess: () => {
        toast.success('Session updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update session', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateSessionDto) => {
    // Get current form values to ensure we have the latest isFreeSession value
    // Use getValues() to get the actual current form state
    const formValues = form.getValues();
    
    // Transform dateTime to string format if it's a Date object
    const submitData: UpdateSessionDto = {
      ...data,
      dateTime:
        data.dateTime instanceof Date ? format(data.dateTime, "yyyy-MM-dd'T'HH:mm") : data.dateTime,
      // For individual sessions, ensure kidId is set from kids array if needed
      kidId:
        session.type === SessionType.INDIVIDUAL && data.kids && data.kids.length > 0
          ? data.kids[0]
          : data.kidId,
      // Explicitly include isFreeSession from form values to ensure it's always in the payload
      isFreeSession: formValues.isFreeSession !== undefined ? formValues.isFreeSession : false,
    };
    updateMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Edit Session</DialogTitle>
              <DialogDescription className="text-sm">Update session information</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-session-form" className="space-y-4">
            {/* Session Type - Read-only display */}
            <CustomFormField label="Session Type">
              <Input
                value={session.type === SessionType.INDIVIDUAL ? 'Individual' : 'Group'}
                disabled
                className="bg-muted"
              />
            </CustomFormField>

            <CustomFormField label="Coach" required error={form.formState.errors.coachId?.message}>
              <Select
                value={form.watch('coachId') || ''}
                onValueChange={value => form.setValue('coachId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {(coachesData?.data || []).map(coach => {
                    const coachId = coach.id;
                    return (
                      <SelectItem key={coachId} value={coachId}>
                        {coach.coachProfile?.name || coach.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CustomFormField>

            <CustomFormField
              label="Location"
              required
              error={form.formState.errors.locationId?.message}
            >
              <Select
                value={form.watch('locationId') || ''}
                onValueChange={value => form.setValue('locationId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(locationsData?.data || []).map(location => {
                    const locationId = location.id;
                    return (
                      <SelectItem key={locationId} value={locationId}>
                        {location.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CustomFormField>

            <CustomFormField
              label="Date & Time"
              required
              error={form.formState.errors.dateTime?.message}
            >
              <DateTimePicker
                date={(() => {
                  const dateTime = form.watch('dateTime');
                  if (!dateTime) return undefined;
                  if (typeof dateTime === 'string') return new Date(dateTime);
                  return dateTime;
                })()}
                onSelect={date => {
                  if (date) {
                    form.setValue('dateTime', date);
                  } else {
                    form.setValue('dateTime', undefined);
                  }
                }}
                placeholder="Pick date and time"
              />
            </CustomFormField>

            <CustomFormField
              label="Duration (minutes)"
              required
              error={form.formState.errors.duration?.message}
            >
              <Input type="number" {...form.register('duration', { valueAsNumber: true })} />
            </CustomFormField>

            {session.type === SessionType.GROUP && (
              <>
                <CustomFormField label="Capacity" error={form.formState.errors.capacity?.message}>
                  <Input type="number" {...form.register('capacity', { valueAsNumber: true })} />
                </CustomFormField>
                <CustomFormField label="Kids" error={form.formState.errors.kids?.message}>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {(kidsData?.data || []).map(kid => {
                      const kidId = kid.id;
                      return (
                        <div key={kidId} className="flex items-center space-x-2">
                          <Checkbox
                            checked={form.watch('kids')?.includes(kidId) || false}
                            onCheckedChange={checked => {
                              const currentKids = form.watch('kids') || [];
                              if (checked) {
                                form.setValue('kids', [...currentKids, kidId]);
                              } else {
                                form.setValue(
                                  'kids',
                                  currentKids.filter(id => id !== kidId)
                                );
                              }
                            }}
                          />
                          <label className="text-sm">{kid.name}</label>
                        </div>
                      );
                    })}
                  </div>
                </CustomFormField>
              </>
            )}

            {session.type === SessionType.INDIVIDUAL && (
              <CustomFormField label="Kid" required error={form.formState.errors.kidId?.message}>
                <Select
                  value={form.watch('kidId') || form.watch('kids')?.[0] || ''}
                  onValueChange={value => {
                    form.setValue('kidId', value);
                    form.setValue('kids', [value]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select kid" />
                  </SelectTrigger>
                  <SelectContent>
                    {(kidsData?.data || []).map(kid => {
                      const kidId = kid.id;
                      return (
                        <SelectItem key={kidId} value={kidId}>
                          {kid.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CustomFormField>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFreeSession"
                checked={form.watch('isFreeSession') || false}
                onCheckedChange={checked => {
                  form.setValue('isFreeSession', checked === true, { shouldDirty: true, shouldValidate: true });
                }}
              />
              <label htmlFor="isFreeSession" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Free session
              </label>
            </div>

            <CustomFormField label="Status" error={form.formState.errors.status?.message}>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as SessionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SessionStatus.SCHEDULED}>Scheduled</SelectItem>
                  <SelectItem value={SessionStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={SessionStatus.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={SessionStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </CustomFormField>

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-session-form" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
