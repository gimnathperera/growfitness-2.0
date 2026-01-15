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
import { UpdateKidSchema, UpdateKidDto } from '@grow-fitness/shared-schemas';
import { Kid, SessionType } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { kidsService } from '@/services/kids.service';
import { useToast } from '@/hooks/useToast';
import { DatePicker } from '@/components/common/DatePicker';
import { format } from 'date-fns';

interface EditKidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kid: Kid;
}

export function EditKidDialog({ open, onOpenChange, kid }: EditKidDialogProps) {
  const { toast } = useToast();

  const form = useForm<UpdateKidDto>({
    resolver: zodResolver(UpdateKidSchema),
    defaultValues: {
      name: kid.name,
      gender: kid.gender,
      birthDate:
        typeof kid.birthDate === 'string'
          ? kid.birthDate
          : format(new Date(kid.birthDate), 'yyyy-MM-dd'),
      goal: kid.goal,
      currentlyInSports: kid.currentlyInSports,
      medicalConditions: kid.medicalConditions || [],
      sessionType: kid.sessionType,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: kid.name,
        gender: kid.gender,
        birthDate:
          typeof kid.birthDate === 'string'
            ? kid.birthDate
            : format(new Date(kid.birthDate), 'yyyy-MM-dd'),
        goal: kid.goal,
        currentlyInSports: kid.currentlyInSports,
        medicalConditions: kid.medicalConditions || [],
        sessionType: kid.sessionType,
      });
    }
  }, [open, kid, form]);

  const updateMutation = useApiMutation(
    (data: UpdateKidDto) => kidsService.updateKid(kid.id, data),
    {
      invalidateQueries: [['kids']],
      onSuccess: () => {
        toast.success('Kid updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update kid', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateKidDto) => {
    const formattedData = {
      ...data,
      birthDate:
        typeof data.birthDate === 'string'
          ? data.birthDate
          : format(data.birthDate as Date, 'yyyy-MM-dd'),
    };
    updateMutation.mutate(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Kid</DialogTitle>
          <DialogDescription>Update kid information</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </CustomFormField>

            <CustomFormField label="Gender" required error={form.formState.errors.gender?.message}>
              <Select
                value={form.watch('gender')}
                onValueChange={value => form.setValue('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </CustomFormField>

            <CustomFormField
              label="Birth Date"
              required
              error={form.formState.errors.birthDate?.message}
            >
              <DatePicker
                date={
                  form.watch('birthDate') ? new Date(form.watch('birthDate') as string) : undefined
                }
                onSelect={date =>
                  form.setValue('birthDate', date ? format(date, 'yyyy-MM-dd') : '')
                }
              />
            </CustomFormField>

            <CustomFormField label="Goal" error={form.formState.errors.goal?.message}>
              <Input {...form.register('goal')} />
            </CustomFormField>

            <CustomFormField
              label="Session Type"
              required
              error={form.formState.errors.sessionType?.message}
            >
              <Select
                value={form.watch('sessionType')}
                onValueChange={value => form.setValue('sessionType', value as SessionType)}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentlyInSports"
                {...form.register('currentlyInSports')}
                className="rounded"
              />
              <label htmlFor="currentlyInSports" className="text-sm">
                Currently in sports
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
