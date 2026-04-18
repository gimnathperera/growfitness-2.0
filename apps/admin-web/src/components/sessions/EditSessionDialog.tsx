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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import {
  UpdateSessionSchema,
  UpdateSessionDto,
  CreateRecurringSessionDto,
} from '@grow-fitness/shared-schemas';
import {
  Session,
  SessionStatus,
  SessionType,
  RecurrenceFrequency,
} from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { formatSessionType } from '@/lib/formatters';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';
import { Repeat } from 'lucide-react';

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
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

// Helper to extract ID from populated object or string
function extractId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'object' &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'string'
  ) {
    return (value as { id: string }).id;
  }
  return '';
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return undefined;
}

export function EditSessionDialog({
  open,
  onOpenChange,
  session: sessionProp,
}: EditSessionDialogProps) {
  const { toast } = useToast();
  const { entityId, closeModal } = useModalParams('sessionId');
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [endType, setEndType] = useState<'never' | 'on' | 'after'>('never');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState(13);

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
      title: session.title || '',
      coachId: extractId(session.coachId),
      locationId: extractId(session.locationId),
      dateTime: getDateValue(session.dateTime),
      duration: session.duration,
      capacity: session.capacity,
      status: session.status,
      kids: Array.isArray(session.kids)
        ? session.kids.map(kid => extractId(kid)).filter(Boolean)
        : session.kidId
          ? [extractId(session.kidId)].filter(Boolean)
          : undefined,
      kidId: session.kidId ? extractId(session.kidId) : undefined,
      isFreeSession: session.isFreeSession,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: session.title || '',
        coachId: extractId(session.coachId),
        locationId: extractId(session.locationId),
        dateTime: getDateValue(session.dateTime),
        duration: session.duration,
        capacity: session.capacity,
        status: session.status,
        kids: Array.isArray(session.kids)
          ? session.kids.map(kid => extractId(kid)).filter(Boolean)
          : session.kidId
            ? [extractId(session.kidId)].filter(Boolean)
            : undefined,
        kidId: session.kidId ? extractId(session.kidId) : undefined,
        isFreeSession: session.isFreeSession,
      });
      setRepeatMode('none');
      setInterval(1);
      setDaysOfWeek([]);
      setEndType('never');
      setEndDate('');
      setOccurrences(13);
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

  const createRecurringMutation = useApiMutation(
    (data: CreateRecurringSessionDto) => sessionsService.createRecurringSessions(data),
    {
      invalidateQueries: [['sessions']],
    }
  );

  const deleteMutation = useApiMutation((id: string) => sessionsService.deleteSession(id), {
    invalidateQueries: [['sessions']],
  });

  const onSubmit = async (data: UpdateSessionDto) => {
    // Get current form values to ensure we have the latest values
    // Use getValues() to get the actual current form state
    const formValues = form.getValues();

    // Transform dateTime to string format if it's a Date object
    const normalizedKids =
      session.type === SessionType.INDIVIDUAL
        ? data.kids && data.kids.length > 0
          ? data.kids
          : data.kidId
            ? [data.kidId]
            : []
        : data.kids || [];

    const submitData: UpdateSessionDto = {
      ...data,
      title: formValues.title || data.title, // Explicitly include title from form values
      dateTime:
        data.dateTime instanceof Date ? format(data.dateTime, "yyyy-MM-dd'T'HH:mm") : data.dateTime,
      // For individual sessions, ensure kidId is set from kids array if needed
      kidId:
        session.type === SessionType.INDIVIDUAL && normalizedKids.length > 0
          ? normalizedKids[0]
          : data.kidId,
      kids: normalizedKids,
      // Explicitly include isFreeSession from form values to ensure it's always in the payload
      isFreeSession: formValues.isFreeSession !== undefined ? formValues.isFreeSession : false,
    };

    if (repeatMode === 'none') {
      updateMutation.mutate(submitData);
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
    if (Number.isNaN(startDate.getTime())) {
      toast.error('Invalid session date/time');
      return;
    }

    const recurringPayload: CreateRecurringSessionDto = {
      title: submitData.title || session.title,
      type: session.type,
      coachId: submitData.coachId || extractId(session.coachId),
      locationId: submitData.locationId || extractId(session.locationId),
      startDate: format(startDate, 'yyyy-MM-dd'),
      time: format(startDate, 'HH:mm'),
      duration: submitData.duration || session.duration,
      capacity: submitData.capacity || session.capacity,
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

    try {
      const recurringData = await createRecurringMutation.mutateAsync(recurringPayload);
      try {
        await deleteMutation.mutateAsync(session.id);
        toast.success(`${recurringData.created} recurring sessions created`);
      } catch (deleteError: unknown) {
        toast.error(
          'Recurring sessions created, but failed to delete original session',
          getErrorMessage(deleteError) || 'Please delete the original session manually'
        );
      }
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        'Failed to create recurring sessions',
        getErrorMessage(error) || 'An error occurred'
      );
    }
  };

  const isSubmitting =
    updateMutation.isPending || createRecurringMutation.isPending || deleteMutation.isPending;

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
            <form
              onSubmit={event => {
                void form.handleSubmit(onSubmit)(event);
              }}
              id="edit-session-form"
              className="space-y-4"
            >
              <CustomFormField label="Title" required error={form.formState.errors.title?.message}>
                <Input {...form.register('title')} placeholder="Enter session title" />
              </CustomFormField>

              {/* Session Type - Read-only display */}
              <CustomFormField label="Session Type">
                <Input value={formatSessionType(session.type)} disabled className="bg-muted" />
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
              )}

              {/* Repeat */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={repeatMode}
                    onValueChange={value => setRepeatMode(value as RepeatMode)}
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
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap">Repeat every</span>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={interval}
                        onChange={e => setInterval(Math.max(1, Number(e.target.value) || 1))}
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
                                setDaysOfWeek(current =>
                                  current.includes(day.value)
                                    ? current.filter(value => value !== day.value)
                                    : [...current, day.value].sort((a, b) => a - b)
                                )
                              }
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Ends</Label>
                      <RadioGroup
                        value={endType}
                        onValueChange={value => setEndType(value as typeof endType)}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="on" id="edit-end-on" />
                          <Label htmlFor="edit-end-on" className="text-sm font-normal">
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
                          <RadioGroupItem value="after" id="edit-end-after" />
                          <Label htmlFor="edit-end-after" className="text-sm font-normal">
                            After
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={52}
                            value={occurrences}
                            onChange={e => {
                              setOccurrences(Math.max(1, Number(e.target.value) || 1));
                              setEndType('after');
                            }}
                            className="h-8 w-20 text-sm"
                            disabled={endType !== 'after'}
                          />
                          <span className="text-sm text-muted-foreground">occurrences</span>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFreeSession"
                  checked={form.watch('isFreeSession') || false}
                  onCheckedChange={checked => {
                    form.setValue('isFreeSession', checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
                <label
                  htmlFor="isFreeSession"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
              <Button type="submit" form="edit-session-form" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
