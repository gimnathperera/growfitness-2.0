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
import { CreateKidSchema, CreateKidDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { DatePicker } from '@/components/common/DatePicker';
import { format } from 'date-fns';

interface CreateKidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKidDialog({ open, onOpenChange }: CreateKidDialogProps) {
  const { toast } = useToast();

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 1000)
  );

  const form = useForm<CreateKidDto>({
    resolver: zodResolver(CreateKidSchema),
    defaultValues: {
      name: '',
      gender: '',
      birthDate: '',
      goal: '',
      currentlyInSports: false,
      medicalConditions: [],
      sessionType: SessionType.INDIVIDUAL,
      parentId: '',
    },
  });

  const createMutation = useApiMutation((data: CreateKidDto) => kidsService.createKid(data), {
    invalidateQueries: [['kids']],
    onSuccess: () => {
      toast.success('Kid created successfully');
      form.reset();
      onOpenChange(false);
    },
    onError: error => {
      toast.error('Failed to create kid', error.message);
    },
  });

  const onSubmit = (data: CreateKidDto) => {
    const formattedData = {
      ...data,
      birthDate:
        typeof data.birthDate === 'string'
          ? data.birthDate
          : format(data.birthDate as Date, 'yyyy-MM-dd'),
    };
    createMutation.mutate(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Kid</DialogTitle>
          <DialogDescription>Add a new kid to the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField label="Parent" required error={form.formState.errors.parentId?.message}>
            <Select
              value={form.watch('parentId')}
              onValueChange={value => form.setValue('parentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                {parentsData?.data.map(parent => (
                  <SelectItem key={parent._id} value={parent._id}>
                    {parent.parentProfile?.name || parent.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CustomFormField>

          <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </CustomFormField>

          <CustomFormField label="Gender" required error={form.formState.errors.gender?.message}>
            <Select
              value={form.watch('gender')}
              onValueChange={value => form.setValue('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
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
              date={form.watch('birthDate') ? new Date(form.watch('birthDate')) : undefined}
              onSelect={date => form.setValue('birthDate', date ? format(date, 'yyyy-MM-dd') : '')}
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Kid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
