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
import { Switch } from '@/components/ui/switch';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { UpdateLocationSchema, UpdateLocationDto } from '@grow-fitness/shared-schemas';
import { Location } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { locationsService } from '@/services/locations.service';
import { useToast } from '@/hooks/useToast';

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location;
}

export function EditLocationDialog({ open, onOpenChange, location }: EditLocationDialogProps) {
  const { toast } = useToast();

  const form = useForm<UpdateLocationDto>({
    resolver: zodResolver(UpdateLocationSchema),
    defaultValues: {
      name: location.name,
      address: location.address,
      isActive: location.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: location.name,
        address: location.address,
        isActive: location.isActive,
      });
    }
  }, [open, location, form]);

  const updateMutation = useApiMutation(
    (data: UpdateLocationDto) => locationsService.updateLocation(location._id, data),
    {
      invalidateQueries: [['locations']],
      onSuccess: () => {
        toast.success('Location updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update location', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateLocationDto) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>Update location information</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField label="Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </CustomFormField>

          <CustomFormField label="Address" required error={form.formState.errors.address?.message}>
            <Input {...form.register('address')} />
          </CustomFormField>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={checked => form.setValue('isActive', checked)}
            />
            <label className="text-sm">Active</label>
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
      </DialogContent>
    </Dialog>
  );
}
