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
import { UpdateSessionSchema, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
}

export function EditSessionDialog({ open, onOpenChange, session }: EditSessionDialogProps) {
  const { toast } = useToast();

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 1000)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 1000)
  );

  const form = useForm<UpdateSessionDto>({
    resolver: zodResolver(UpdateSessionSchema),
    defaultValues: {
      coachId: session.coachId,
      locationId: session.locationId,
      dateTime:
        typeof session.dateTime === 'string'
          ? session.dateTime
          : format(new Date(session.dateTime), "yyyy-MM-dd'T'HH:mm"),
      duration: session.duration,
      capacity: session.capacity,
      status: session.status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        coachId: session.coachId,
        locationId: session.locationId,
        dateTime:
          typeof session.dateTime === 'string'
            ? session.dateTime
            : format(new Date(session.dateTime), "yyyy-MM-dd'T'HH:mm"),
        duration: session.duration,
        capacity: session.capacity,
        status: session.status,
      });
    }
  }, [open, session, form]);

  const updateMutation = useApiMutation(
    (data: UpdateSessionDto) => sessionsService.updateSession(session._id, data),
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
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>Update session information</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField label="Coach" required error={form.formState.errors.coachId?.message}>
            <Select
              value={form.watch('coachId')}
              onValueChange={value => form.setValue('coachId', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {coachesData?.data.map(coach => (
                  <SelectItem key={coach._id} value={coach._id}>
                    {coach.coachProfile?.name || coach.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CustomFormField>

          <CustomFormField
            label="Location"
            required
            error={form.formState.errors.locationId?.message}
          >
            <Select
              value={form.watch('locationId')}
              onValueChange={value => form.setValue('locationId', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationsData?.data.map(location => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CustomFormField>

          <CustomFormField
            label="Date & Time"
            required
            error={form.formState.errors.dateTime?.message}
          >
            <Input type="datetime-local" {...form.register('dateTime')} />
          </CustomFormField>

          <CustomFormField
            label="Duration (minutes)"
            required
            error={form.formState.errors.duration?.message}
          >
            <Input type="number" {...form.register('duration', { valueAsNumber: true })} />
          </CustomFormField>

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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
