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
import { CreateLocationSchema, CreateLocationDto } from '@grow-fitness/shared-schemas';
import { useApiMutation } from '@/hooks/useApiMutation';
import { locationsService } from '@/services/locations.service';
import { useToast } from '@/hooks/useToast';

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLocationDialog({ open, onOpenChange }: CreateLocationDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateLocationDto>({
    resolver: zodResolver(CreateLocationSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const createMutation = useApiMutation(
    (data: CreateLocationDto) => locationsService.createLocation(data),
    {
      invalidateQueries: [['locations']],
      onSuccess: () => {
        toast.success('Location created successfully');
        form.reset();
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to create location', error.message);
      },
    }
  );

  const onSubmit = (data: CreateLocationDto) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Location</DialogTitle>
          <DialogDescription>Add a new training location</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </CustomFormField>

          <CustomFormField label="Address" required error={form.formState.errors.address?.message}>
            <Input {...form.register('address')} />
          </CustomFormField>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
