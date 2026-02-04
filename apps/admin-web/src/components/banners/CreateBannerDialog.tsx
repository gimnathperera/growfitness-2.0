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
import { CreateBannerSchema, CreateBannerDto } from '@grow-fitness/shared-schemas';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { bannersService } from '@/services/banners.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBannerDialog({ open, onOpenChange }: CreateBannerDialogProps) {
  const { closeModal } = useModalParams('bannerId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const defaultValues = {
    imageUrl: '',
    active: true,
    order: 0,
    targetAudience: BannerTargetAudience.ALL,
  };

  const form = useForm<CreateBannerDto>({
    resolver: zodResolver(CreateBannerSchema),
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

  const createMutation = useApiMutation(
    (data: CreateBannerDto) => bannersService.createBanner(data),
    {
      invalidateQueries: [['banners']],
      onSuccess: () => {
        toast.success('Banner created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create banner', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateBannerDto) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Banner</DialogTitle>
              <DialogDescription className="text-sm">Add a new promotional banner</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-banner-form" className="space-y-4">
              <CustomFormField
                label="Image URL"
                required
                error={form.formState.errors.imageUrl?.message}
              >
                <Input {...form.register('imageUrl')} placeholder="https://example.com/banner.jpg" />
              </CustomFormField>

              <CustomFormField label="Order" required error={form.formState.errors.order?.message}>
                <Input type="number" {...form.register('order', { valueAsNumber: true })} />
              </CustomFormField>

              <CustomFormField
                label="Target Audience"
                required
                error={form.formState.errors.targetAudience?.message}
              >
                <Select
                  value={form.watch('targetAudience')}
                  onValueChange={value =>
                    form.setValue('targetAudience', value as BannerTargetAudience)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BannerTargetAudience.ALL}>All</SelectItem>
                    <SelectItem value={BannerTargetAudience.PARENT}>Parent</SelectItem>
                    <SelectItem value={BannerTargetAudience.COACH}>Coach</SelectItem>
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
              <Button type="submit" form="create-banner-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Banner'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
