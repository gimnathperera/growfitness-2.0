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
import { useApiQuery } from '@/hooks/useApiQuery';
import { useModalParams } from '@/hooks/useModalParams';

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location;
}

export function EditLocationDialog({ open, onOpenChange, location: locationProp }: EditLocationDialogProps) {
  const { entityId, closeModal } = useModalParams('locationId');
  
  // Fetch location from URL if prop not provided
  const { data: locationFromUrl } = useApiQuery<Location>(
    ['locations', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Location ID is required');
      }
      return locationsService.getLocationById(entityId);
    },
    {
      enabled: open && !locationProp && !!entityId,
    }
  );

  const location = locationProp || locationFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!location) {
    return null;
  }
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
    (data: UpdateLocationDto) => locationsService.updateLocation(location.id, data),
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Edit Location</DialogTitle>
              <DialogDescription className="text-sm">Update location information</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-location-form" className="space-y-4">
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
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-location-form" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
