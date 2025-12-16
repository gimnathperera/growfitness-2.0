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
import { CreateSessionSchema, CreateSessionDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const { toast } = useToast();

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 1000)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 1000)
  );

  const { data: kidsData } = useApiQuery(['kids', 'all'], () => kidsService.getKids(1, 1000));

  const form = useForm<CreateSessionDto>({
    resolver: zodResolver(CreateSessionSchema),
    defaultValues: {
      type: SessionType.GROUP,
      coachId: '',
      locationId: '',
      dateTime: '',
      duration: 60,
      capacity: 10,
      kids: [],
      kidId: undefined,
      isFreeSession: false,
    },
  });

  const createMutation = useApiMutation(
    (data: CreateSessionDto) => sessionsService.createSession(data),
    {
      invalidateQueries: [['sessions']],
      onSuccess: () => {
        toast.success('Session created successfully');
        form.reset();
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to create session', error.message);
      },
    }
  );

  const onSubmit = (data: CreateSessionDto) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>Add a new training session</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              value={form.watch('coachId')}
              onValueChange={value => form.setValue('coachId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coach" />
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
                <SelectValue placeholder="Select location" />
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

          {form.watch('type') === SessionType.GROUP && (
            <>
              <CustomFormField label="Capacity" error={form.formState.errors.capacity?.message}>
                <Input type="number" {...form.register('capacity', { valueAsNumber: true })} />
              </CustomFormField>
              <CustomFormField label="Kids" required error={form.formState.errors.kids?.message}>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {kidsData?.data.map(kid => (
                    <div key={kid._id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={form.watch('kids')?.includes(kid._id) || false}
                        onCheckedChange={checked => {
                          const currentKids = form.watch('kids') || [];
                          if (checked) {
                            form.setValue('kids', [...currentKids, kid._id]);
                          } else {
                            form.setValue(
                              'kids',
                              currentKids.filter(id => id !== kid._id)
                            );
                          }
                        }}
                      />
                      <label className="text-sm">{kid.name}</label>
                    </div>
                  ))}
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
                  {kidsData?.data.map(kid => (
                    <SelectItem key={kid._id} value={kid._id}>
                      {kid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CustomFormField>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFreeSession"
              {...form.register('isFreeSession')}
              className="rounded"
            />
            <label htmlFor="isFreeSession" className="text-sm">
              Free session
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
