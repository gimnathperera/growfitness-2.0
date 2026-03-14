import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as CustomFormField } from '@/components/common/FormField';
import {
  UpdateParentSchema,
  UpdateCoachSchema,
  UpdateParentDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { User, UserStatus, EmploymentType } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useModalParams } from '@/hooks/useModalParams';
import { Plus, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function flattenNestedArray<T>(value: T | T[] | (T | T[])[]): T[] {
  if (!Array.isArray(value)) {
    return [value];
  }

  return value.flatMap(item => flattenNestedArray(item as T | T[] | (T | T[])[]));
}

function normalizeAvailableTimes(
  values: UpdateCoachDto['availableTimes']
): UpdateCoachDto['availableTimes'] {
  if (!values) {
    return values;
  }

  return flattenNestedArray(values)
    .filter((slot): slot is NonNullable<UpdateCoachDto['availableTimes']>[number] => Boolean(slot));
}

function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  userType: 'parent' | 'coach';
}

export function EditUserDialog({
  open,
  onOpenChange,
  user: userProp,
  userType,
}: EditUserDialogProps) {
  const { entityId, closeModal } = useModalParams('userId');

  // Fetch user from URL if prop not provided
  const { data: userFromUrl } = useApiQuery<User>(
    ['users', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('User ID is required');
      }
      return userType === 'parent'
        ? usersService.getParentById(entityId)
        : usersService.getCoachById(entityId);
    },
    {
      enabled: open && !userProp && !!entityId,
    }
  );

  const user = userProp || userFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!user) {
    return null;
  }
  const { toast } = useToast();

  const coachDefaults =
    userType === 'coach'
      ? {
          dateOfBirth: formatDateForInput(
            (user as User).coachProfile?.dateOfBirth as Date | string | undefined
          ),
          photoUrl: (user as User).coachProfile?.photoUrl ?? '',
          homeAddress: (user as User).coachProfile?.homeAddress ?? '',
          school: (user as User).coachProfile?.school ?? '',
          availableTimes:
            (user as User).coachProfile?.availableTimes?.map((t) => ({
              dayOfWeek: t.dayOfWeek,
              startTime: t.startTime,
              endTime: t.endTime,
            })) ?? [],
          employmentType: (user as User).coachProfile?.employmentType ?? undefined,
          cvUrl: (user as User).coachProfile?.cvUrl ?? '',
        }
      : {};

  const form = useForm<UpdateParentDto | UpdateCoachDto>({
    resolver: zodResolver(userType === 'parent' ? UpdateParentSchema : UpdateCoachSchema),
    defaultValues: {
      name: userType === 'parent' ? user.parentProfile?.name : user.coachProfile?.name,
      email: user.email,
      phone: user.phone,
      location: userType === 'parent' ? user.parentProfile?.location : undefined,
      status: user.status,
      ...coachDefaults,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availableTimes',
  });

  useEffect(() => {
    if (open) {
      const coachReset =
        userType === 'coach'
          ? {
              dateOfBirth: formatDateForInput(
                (user as User).coachProfile?.dateOfBirth as Date | string | undefined
              ),
              photoUrl: (user as User).coachProfile?.photoUrl ?? '',
              homeAddress: (user as User).coachProfile?.homeAddress ?? '',
              school: (user as User).coachProfile?.school ?? '',
              availableTimes:
                (user as User).coachProfile?.availableTimes?.map((t) => ({
                  dayOfWeek: t.dayOfWeek,
                  startTime: t.startTime,
                  endTime: t.endTime,
                })) ?? [],
              employmentType: (user as User).coachProfile?.employmentType ?? undefined,
              cvUrl: (user as User).coachProfile?.cvUrl ?? '',
            }
          : {
              dateOfBirth: undefined,
              photoUrl: undefined,
              homeAddress: undefined,
              school: undefined,
              availableTimes: undefined,
              employmentType: undefined,
              cvUrl: undefined,
            };
      form.reset({
        name: userType === 'parent' ? user.parentProfile?.name : user.coachProfile?.name,
        email: user.email,
        phone: user.phone,
        location: userType === 'parent' ? user.parentProfile?.location : undefined,
        status: user.status,
        ...coachReset,
      });
    }
  }, [open, user, userType, form]);

  const updateMutation = useApiMutation(
    (data: UpdateParentDto | UpdateCoachDto) => {
      if (userType === 'parent') {
        return usersService.updateParent(user.id, data as UpdateParentDto);
      } else {
        return usersService.updateCoach(user.id, data as UpdateCoachDto);
      }
    },
    {
      invalidateQueries: [[`users`, userType === 'parent' ? 'parents' : 'coaches']],
      onSuccess: () => {
        toast.success(`${userType === 'parent' ? 'Parent' : 'Coach'} updated successfully`);
        onOpenChange(false);
      },
      onError: error => {
        toast.error(`Failed to update ${userType}`, error.message);
      },
    }
  );

  const onSubmit = (data: UpdateParentDto | UpdateCoachDto) => {
    if (userType === 'coach') {
      updateMutation.mutate({
        ...(data as UpdateCoachDto),
        availableTimes: normalizeAvailableTimes((data as UpdateCoachDto).availableTimes),
      });
      return;
    }

    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Edit {userType === 'parent' ? 'Parent' : 'Coach'}</DialogTitle>
              <DialogDescription className="text-sm">Update user information</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-user-form" className="space-y-4">
            <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </CustomFormField>

            <CustomFormField label="Email" required error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register('email')} />
            </CustomFormField>

            <CustomFormField label="Phone" required error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} />
            </CustomFormField>

            {userType === 'parent' && (
              <CustomFormField
                label="Location"
                error={(form.formState.errors as { location?: { message?: string } }).location?.message}
              >
                <Input {...form.register('location')} />
              </CustomFormField>
            )}

            {userType === 'coach' && (
              <>
                <CustomFormField
                  label="Date of birth"
                  error={(form.formState.errors as { dateOfBirth?: { message?: string } }).dateOfBirth?.message}
                >
                  <Input type="date" {...form.register('dateOfBirth')} />
                </CustomFormField>
                <CustomFormField
                  label="Photo URL"
                  error={(form.formState.errors as { photoUrl?: { message?: string } }).photoUrl?.message}
                >
                  <Input type="url" placeholder="https://..." {...form.register('photoUrl')} />
                </CustomFormField>
                <CustomFormField
                  label="Home address"
                  error={(form.formState.errors as { homeAddress?: { message?: string } }).homeAddress?.message}
                >
                  <Textarea rows={2} {...form.register('homeAddress')} />
                </CustomFormField>
                <CustomFormField
                  label="School"
                  error={(form.formState.errors as { school?: { message?: string } }).school?.message}
                >
                  <Input {...form.register('school')} />
                </CustomFormField>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Available times</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add slot
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-end flex-wrap">
                      <Select
                        value={form.watch(`availableTimes.${index}.dayOfWeek`)}
                        onValueChange={(v) => form.setValue(`availableTimes.${index}.dayOfWeek`, v)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        className="w-[100px]"
                        {...form.register(`availableTimes.${index}.startTime`)}
                      />
                      <Input
                        type="time"
                        className="w-[100px]"
                        {...form.register(`availableTimes.${index}.endTime`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <CustomFormField
                  label="Employment type"
                  error={(form.formState.errors as { employmentType?: { message?: string } }).employmentType?.message}
                >
                  <Select
                    value={form.watch('employmentType') ?? ''}
                    onValueChange={(v) =>
                      form.setValue('employmentType', v ? (v as EmploymentType) : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EmploymentType.FULL_TIME}>Full time</SelectItem>
                      <SelectItem value={EmploymentType.PART_TIME}>Part time</SelectItem>
                      <SelectItem value={EmploymentType.CONTRACT}>Contract</SelectItem>
                      <SelectItem value={EmploymentType.VOLUNTEER}>Volunteer</SelectItem>
                      <SelectItem value={EmploymentType.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </CustomFormField>
                <CustomFormField
                  label="CV URL"
                  error={(form.formState.errors as { cvUrl?: { message?: string } }).cvUrl?.message}
                >
                  <Input type="url" placeholder="https://..." {...form.register('cvUrl')} />
                </CustomFormField>
              </>
            )}

            <CustomFormField label="Status" error={form.formState.errors.status?.message}>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userType === 'parent' ? (
                    <>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                      <SelectItem value={UserStatus.DELETED}>Deleted</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                    </>
                  )}
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
              <Button type="submit" form="edit-user-form" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
