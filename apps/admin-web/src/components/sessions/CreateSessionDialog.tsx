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
import { FormField as CustomFormField } from '@/components/common/FormField';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { CreateSessionSchema, CreateSessionDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const { closeModal } = useModalParams('sessionId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );

  const { data: kidsData } = useApiQuery(['kids', 'all'], () => kidsService.getKids(1, 100));

  const defaultValues = {
    type: SessionType.GROUP,
    coachId: '',
    locationId: '',
    dateTime: '',
    duration: 60,
    capacity: 10,
    kids: [],
    kidId: undefined,
    isFreeSession: false,
  };

  const form = useForm<CreateSessionDto>({
    resolver: zodResolver(CreateSessionSchema),
    defaultValues,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    } else {
      form.reset(defaultValues);
    }
  }, [open]);

  const createMutation = useApiMutation(
    (data: CreateSessionDto) => sessionsService.createSession(data),
    {
      invalidateQueries: [['sessions']],
      onSuccess: () => {
        toast.success('Session created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create session', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateSessionDto) => {
    // Transform kidId to kids array for individual sessions (API expects kids array always)
    const submitData: CreateSessionDto = {
      ...data,
      kids: data.type === SessionType.INDIVIDUAL && data.kidId
        ? [data.kidId]
        : data.kids || [],
      kidId: undefined, // Remove kidId as API doesn't use it
    };
    createMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Session</DialogTitle>
              <DialogDescription className="text-sm">Add a new training session</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-session-form" className="space-y-4">
          <CustomFormField
            label="Session Type"
            required
            error={form.formState.errors.type?.message}
          >
            <Select
              value={form.watch('type')}
              onValueChange={value => {
                form.setValue('type', value as SessionType);
                // Clear kids/kidId when switching types
                if (value === SessionType.GROUP) {
                  form.setValue('kidId', undefined);
                  form.setValue('kids', []);
                } else {
                  form.setValue('kids', undefined);
                  form.setValue('kidId', '');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SessionType.INDIVIDUAL}>Individual</SelectItem>
                <SelectItem value={SessionType.GROUP}>Group</SelectItem>
              </SelectContent>
            </Select>
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
              date={
                form.watch('dateTime')
                  ? typeof form.watch('dateTime') === 'string'
                    ? new Date(form.watch('dateTime'))
                    : form.watch('dateTime')
                  : undefined
              }
              onSelect={date => {
                if (date) {
                  // Format as ISO string for the API (yyyy-MM-ddTHH:mm format)
                  form.setValue('dateTime', format(date, "yyyy-MM-dd'T'HH:mm"));
                } else {
                  form.setValue('dateTime', '');
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

          {form.watch('type') === SessionType.GROUP && (
            <>
              <CustomFormField label="Capacity" error={form.formState.errors.capacity?.message}>
                <Input type="number" {...form.register('capacity', { valueAsNumber: true })} />
              </CustomFormField>
              <CustomFormField label="Kids" required error={form.formState.errors.kids?.message}>
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

          {form.watch('type') === SessionType.INDIVIDUAL && (
            <CustomFormField label="Kid" required error={form.formState.errors.kidId?.message}>
              <Select
                value={form.watch('kidId') || ''}
                onValueChange={value => form.setValue('kidId', value)}
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
              checked={form.watch('isFreeSession')}
              onCheckedChange={checked => form.setValue('isFreeSession', checked === true)}
            />
            <label htmlFor="isFreeSession" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Free session
            </label>
          </div>

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-session-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
