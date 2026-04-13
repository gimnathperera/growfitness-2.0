import { useEffect, useState } from 'react';
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
import {
  CreateSessionSchema,
  CreateSessionDto,
  CreateRecurringSessionDto,
} from '@grow-fitness/shared-schemas';
import { SessionType, RecurrenceFrequency } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';
import { Repeat } from 'lucide-react';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEEKDAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

type RepeatMode = 'none' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const { closeModal } = useModalParams('sessionId');
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) closeModal();
    onOpenChange(newOpen);
  };

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );
  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );
  const { data: kidsData } = useApiQuery(['kids', 'all'], () => kidsService.getKids(1, 100));

  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [endType, setEndType] = useState<'never' | 'on' | 'after'>('never');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState(13);

  const defaultValues = {
    title: '',
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
    shouldUnregister: true,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setRepeatMode('none');
    setInterval(1);
    setDaysOfWeek([]);
    setEndType('never');
    setEndDate('');
    setOccurrences(13);
  }, [open]);

  const createMutation = useApiMutation(
    (data: CreateSessionDto) => sessionsService.createSession(data),
    {
      invalidateQueries: [['sessions']],
      onSuccess: () => {
        toast.success('Session created successfully');
        form.reset(defaultValues);
        setTimeout(() => handleOpenChange(false), 100);
      },
      onError: error => {
        toast.error('Failed to create session', error.message || 'An error occurred');
      },
    }
  );

  const createRecurringMutation = useApiMutation(
    (data: CreateRecurringSessionDto) => sessionsService.createRecurringSessions(data),
    {
      invalidateQueries: [['sessions']],
      onSuccess: data => {
        toast.success(`${data.created} recurring sessions created`);
        form.reset(defaultValues);
        setTimeout(() => handleOpenChange(false), 100);
      },
      onError: error => {
        toast.error('Failed to create recurring sessions', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateSessionDto) => {
    const formValues = form.getValues();
    const submitData: CreateSessionDto = {
      ...data,
      title: formValues.title || data.title,
      kids: data.kids || [],
      kidId: undefined,
    };

    if (repeatMode === 'none') {
      createMutation.mutate(submitData);
      return;
    }

    if (!submitData.dateTime) {
      toast.error('Please select date and time');
      return;
    }

    if (repeatMode === 'WEEKLY' && daysOfWeek.length === 0) {
      toast.error('Select at least one weekday');
      return;
    }

    if (endType === 'on' && !endDate) {
      toast.error('Please select an end date');
      return;
    }

    if (endType === 'after' && (!occurrences || occurrences < 1 || occurrences > 52)) {
      toast.error('Occurrences must be between 1 and 52');
      return;
    }

    if (endType === 'never') {
      toast.error('Please select when the recurrence ends');
      return;
    }

    const startDate = new Date(submitData.dateTime);
    const recurringPayload: CreateRecurringSessionDto = {
      title: submitData.title,
      type: submitData.type,
      coachId: submitData.coachId,
      locationId: submitData.locationId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      time: format(startDate, 'HH:mm'),
      duration: submitData.duration,
      capacity: submitData.capacity,
      kids: submitData.kids,
      isFreeSession: submitData.isFreeSession ?? false,
      recurrence: {
        frequency: repeatMode as RecurrenceFrequency,
        interval,
        ...(repeatMode === 'WEEKLY' ? { daysOfWeek } : {}),
        ...(endType === 'on'
          ? { endDate: format(new Date(`${endDate}T00:00:00`), 'yyyy-MM-dd') }
          : { occurrences }),
      },
    };

    createRecurringMutation.mutate(recurringPayload);
  };

  const isSubmitting = createMutation.isPending || createRecurringMutation.isPending;
  const sessionType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0 px-6 pt-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Create Session</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new training session
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="create-session-form"
              className="space-y-4"
              noValidate
            >
              {/* Title */}
              <CustomFormField label="Title" required error={form.formState.errors.title?.message}>
                <Input {...form.register('title')} placeholder="e.g. Saturday Group Training" />
              </CustomFormField>

              {/* Type + Coach  */}
              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  label="Type"
                  required
                  error={form.formState.errors.type?.message}
                >
                  <Select
                    value={sessionType}
                    onValueChange={value => {
                      form.setValue('type', value as SessionType);
                      if (value === SessionType.GROUP) {
                        form.setValue('kidId', undefined);
                        form.setValue('kids', []);
                        form.clearErrors(['kidId', 'kids']);
                      } else {
                        form.setValue('kidId', undefined);
                        form.setValue('kids', []);
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

                <CustomFormField
                  label="Coach"
                  required
                  error={form.formState.errors.coachId?.message}
                >
                  <Select
                    value={form.watch('coachId') || ''}
                    onValueChange={value => form.setValue('coachId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {(coachesData?.data || []).map(coach => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.coachProfile?.name || coach.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CustomFormField>
              </div>

              {/* Location */}
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
                    {(locationsData?.data || []).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CustomFormField>

              {/* Date & Time */}
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
                      form.setValue('dateTime', format(date, "yyyy-MM-dd'T'HH:mm"));
                    } else {
                      form.setValue('dateTime', '');
                    }
                  }}
                  placeholder="Pick date and time"
                />
              </CustomFormField>

              {/* Duration + Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  label="Duration (min)"
                  required
                  error={form.formState.errors.duration?.message}
                >
                  <Input type="number" {...form.register('duration', { valueAsNumber: true })} />
                </CustomFormField>

                {sessionType === SessionType.GROUP && (
                  <CustomFormField
                    label="Capacity"
                    error={form.formState.errors.capacity?.message}
                  >
                    <Input
                      type="number"
                      {...form.register('capacity', { valueAsNumber: true })}
                    />
                  </CustomFormField>
                )}
              </div>

              {sessionType === SessionType.INDIVIDUAL && (
                <CustomFormField
                  label="Kids"
                  required
                  error={form.formState.errors.kids?.message}
                >
                  <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border p-2">
                    {(kidsData?.data || []).map(kid => (
                      <div key={kid.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={form.watch('kids')?.includes(kid.id) || false}
                          onCheckedChange={checked => {
                            const currentKids = form.watch('kids') || [];
                            form.setValue(
                              'kids',
                              checked
                                ? [...currentKids, kid.id]
                                : currentKids.filter(id => id !== kid.id)
                            );
                          }}
                        />
                        <label className="text-sm">{kid.name}</label>
                      </div>
                    ))}
                  </div>
                </CustomFormField>
              )}

              {/* Repeat — compact section */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={repeatMode}
                    onValueChange={v => setRepeatMode(v as RepeatMode)}
                  >
                    <SelectTrigger className="h-8 w-auto min-w-[160px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Does not repeat</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {repeatMode !== 'none' && (
                  <div className="space-y-3 pt-1">
                    {/* Interval */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap">
                        Repeat every
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={interval}
                        onChange={e =>
                          setInterval(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="h-8 w-16 text-center"
                      />
                      <span className="text-muted-foreground">
                        {repeatMode === 'DAILY'
                          ? interval === 1
                            ? 'day'
                            : 'days'
                          : repeatMode === 'WEEKLY'
                            ? interval === 1
                              ? 'week'
                              : 'weeks'
                            : interval === 1
                              ? 'month'
                              : 'months'}
                      </span>
                    </div>

                    {/* Weekday pills (weekly only) */}
                    {repeatMode === 'WEEKLY' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Repeat on</Label>
                        <div className="flex gap-1.5">
                          {WEEKDAYS.map(day => (
                            <button
                              key={day.value}
                              type="button"
                              className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                                daysOfWeek.includes(day.value)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border bg-background hover:bg-muted'
                              }`}
                              onClick={() =>
                                setDaysOfWeek(curr =>
                                  curr.includes(day.value)
                                    ? curr.filter(v => v !== day.value)
                                    : [...curr, day.value].sort((a, b) => a - b)
                                )
                              }
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ends */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Ends</Label>
                      <RadioGroup
                        value={endType}
                        onValueChange={v => setEndType(v as typeof endType)}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="on" id="end-on" />
                          <Label htmlFor="end-on" className="text-sm font-normal">
                            On
                          </Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={e => {
                              setEndDate(e.target.value);
                              setEndType('on');
                            }}
                            className="h-8 w-auto text-sm"
                            disabled={endType !== 'on'}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="after" id="end-after" />
                          <Label htmlFor="end-after" className="text-sm font-normal">
                            After
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={52}
                            value={occurrences}
                            onChange={e => {
                              setOccurrences(
                                Math.max(1, Number(e.target.value) || 1)
                              );
                              setEndType('after');
                            }}
                            className="h-8 w-20 text-sm"
                            disabled={endType !== 'after'}
                          />
                          <span className="text-sm text-muted-foreground">
                            occurrences
                          </span>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              {/* Free session toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFreeSession"
                  checked={form.watch('isFreeSession')}
                  onCheckedChange={checked => form.setValue('isFreeSession', checked === true)}
                />
                <label
                  htmlFor="isFreeSession"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Free session
                </label>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-session-form" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
