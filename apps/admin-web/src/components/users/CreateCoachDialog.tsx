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
import { FormField as CustomFormField } from '@/components/common/FormField';
import { CreateCoachSchema, CreateCoachDto } from '@grow-fitness/shared-schemas';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
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
    createMutation.mutate(data);
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
