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
import { CreateKidSchema, CreateKidDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { DatePicker } from '@/components/common/DatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateKidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateKidDialog({ open, onOpenChange }: CreateKidDialogProps) {
  const { closeModal } = useModalParams('kidId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 100)
  );

  const defaultValues = {
    name: '',
    gender: '',
    birthDate: '',
    goal: '',
    currentlyInSports: false,
    medicalConditions: [],
    sessionType: SessionType.INDIVIDUAL,
    parentId: '',
  };

  const form = useForm<CreateKidDto>({
    resolver: zodResolver(CreateKidSchema),
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

  const createMutation = useApiMutation((data: CreateKidDto) => kidsService.createKid(data), {
    invalidateQueries: [['kids'], ['kids', 'all']],
    onSuccess: () => {
      toast.success('Kid created successfully');
      form.reset(defaultValues);
      setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    },
    onError: error => {
      toast.error('Failed to create kid', error.message || 'An error occurred');
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Kid</DialogTitle>
              <DialogDescription className="text-sm">Add a new kid to the system</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-kid-form" className="space-y-4">
          <CustomFormField label="Parent" required error={form.formState.errors.parentId?.message}>
            <Select
              value={form.watch('parentId')}
              onValueChange={value => form.setValue('parentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                {(parentsData?.data || []).map(parent => (
                  <SelectItem key={parent.id} value={parent.id}>
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
              enableYearMonthDropdown
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
            <Checkbox
              id="currentlyInSports"
              checked={form.watch('currentlyInSports')}
              onCheckedChange={checked => form.setValue('currentlyInSports', checked === true)}
            />
            <label htmlFor="currentlyInSports" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Currently in sports
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
              <Button type="submit" form="create-kid-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Kid'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
