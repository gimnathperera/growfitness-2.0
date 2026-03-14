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
import { CreateCoachSchema, CreateCoachDto } from '@grow-fitness/shared-schemas';
import { EmploymentType } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';
import { Plus, Trash2 } from 'lucide-react';

interface CreateCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function flattenNestedArray<T>(value: T | T[] | (T | T[])[]): T[] {
  if (!Array.isArray(value)) {
    return [value];
  }

  return value.flatMap(item => flattenNestedArray(item as T | T[] | (T | T[])[]));
}

function normalizeAvailableTimes(
  values: CreateCoachDto['availableTimes']
): CreateCoachDto['availableTimes'] {
  if (!values) {
    return [];
  }

  return flattenNestedArray(values)
    .filter((slot): slot is NonNullable<CreateCoachDto['availableTimes']>[number] => Boolean(slot));
}

const defaultValues: CreateCoachDto = {
  name: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: undefined,
  photoUrl: undefined,
  homeAddress: undefined,
  school: undefined,
  availableTimes: [],
  employmentType: undefined,
  cvUrl: undefined,
};

export function CreateCoachDialog({ open, onOpenChange }: CreateCoachDialogProps) {
  const { closeModal } = useModalParams('userId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const form = useForm<CreateCoachDto>({
    resolver: zodResolver(CreateCoachSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availableTimes',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    } else {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const createMutation = useApiMutation(
    (data: CreateCoachDto) => usersService.createCoach(data),
    {
      invalidateQueries: [['users', 'coaches']],
      onSuccess: () => {
        toast.success('Coach created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create coach', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateCoachDto) => {
    const values = form.getValues();
    const payload: CreateCoachDto = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      dateOfBirth: values.dateOfBirth || undefined,
      photoUrl: values.photoUrl || undefined,
      homeAddress: values.homeAddress || undefined,
      school: values.school || undefined,
      availableTimes: normalizeAvailableTimes(values.availableTimes),
      employmentType: values.employmentType ?? undefined,
      cvUrl: values.cvUrl || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Coach</DialogTitle>
              <DialogDescription className="text-sm">Add a new coach to the system</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-coach-form" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
                  <Input {...form.register('name')} />
                </CustomFormField>

                <CustomFormField label="Email" required error={form.formState.errors.email?.message}>
                  <Input type="email" {...form.register('email')} />
                </CustomFormField>

                <CustomFormField label="Phone" required error={form.formState.errors.phone?.message}>
                  <Input {...form.register('phone')} />
                </CustomFormField>

                <CustomFormField
                  label="Password"
                  required
                  error={form.formState.errors.password?.message}
                >
                  <Input type="password" {...form.register('password')} />
                </CustomFormField>

                <CustomFormField label="Date of birth" error={form.formState.errors.dateOfBirth?.message}>
                  <Input type="date" {...form.register('dateOfBirth')} />
                </CustomFormField>

                <CustomFormField label="Employment type" error={form.formState.errors.employmentType?.message}>
                  <Select
                    value={form.watch('employmentType') ?? ''}
                    onValueChange={(v) => form.setValue('employmentType', v ? (v as EmploymentType) : undefined)}
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

                <CustomFormField label="Photo URL" error={form.formState.errors.photoUrl?.message}>
                  <Input type="url" placeholder="https://..." {...form.register('photoUrl')} />
                </CustomFormField>

                <CustomFormField label="CV URL" error={form.formState.errors.cvUrl?.message}>
                  <Input type="url" placeholder="https://..." {...form.register('cvUrl')} />
                </CustomFormField>

                <CustomFormField label="School" error={form.formState.errors.school?.message} className="sm:col-span-2">
                  <Input {...form.register('school')} />
                </CustomFormField>
              </div>

              <CustomFormField label="Home address" error={form.formState.errors.homeAddress?.message}>
                <Textarea rows={2} placeholder="Full address" {...form.register('homeAddress')} />
              </CustomFormField>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Available times</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })}
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-coach-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Coach'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
