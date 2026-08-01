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
import { FileUpload } from '@/components/common/FileUpload';
import { UpdateBannerSchema, UpdateBannerDto } from '@grow-fitness/shared-schemas';
import { Banner, BannerTargetAudience } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { bannersService } from '@/services/banners.service';
import { useToast } from '@/hooks/useToast';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useModalParams } from '@/hooks/useModalParams';

interface EditBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner;
}

export function EditBannerDialog({ open, onOpenChange, banner: bannerProp }: EditBannerDialogProps) {
  const { entityId, closeModal } = useModalParams('bannerId');
  
  // Fetch banner from URL if prop not provided
  const { data: bannerFromUrl } = useApiQuery<Banner>(
    ['banners', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Banner ID is required');
      }
      return bannersService.getBannerById(entityId);
    },
    {
      enabled: open && !bannerProp && !!entityId,
    }
  );

  const banner = bannerProp || bannerFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!banner) {
    return null;
  }
  const { toast } = useToast();

  const form = useForm<UpdateBannerDto>({
    resolver: zodResolver(UpdateBannerSchema),
    defaultValues: {
      imageUrl: banner.imageUrl,
      active: banner.active,
      order: banner.order,
      targetAudience: banner.targetAudience,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        imageUrl: banner.imageUrl,
        active: banner.active,
        order: banner.order,
        targetAudience: banner.targetAudience,
      });
    }
  }, [open, banner, form]);

  const updateMutation = useApiMutation(
    (data: UpdateBannerDto) => bannersService.updateBanner(banner.id, data),
    {
      invalidateQueries: [['banners']],
      onSuccess: () => {
        toast.success('Banner updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update banner', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateBannerDto) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col max-h-[90vh] border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] shadow-2xl rounded-2xl">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-green-50)] flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Edit Banner</DialogTitle>
              <DialogDescription className="text-sm text-[var(--fg-2)] font-semibold">Update banner information</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-banner-form" className="space-y-4">
              <CustomFormField
                label="Banner Image"
                required
                error={form.formState.errors.imageUrl?.message}
              >
                <FileUpload
                  value={form.watch('imageUrl')}
                  onChange={(url) => form.setValue('imageUrl', url)}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                />
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
          <div className="px-6 py-3 border-t border-[var(--gf-green-deep)]/10 bg-[var(--gf-green-50)]/40 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-4 py-2 text-sm text-[var(--gf-green-deep)] font-extrabold uppercase tracking-wider border-2 border-[var(--gf-green-deep)] hover:bg-[var(--fg-6)] transition-all duration-200">
                Cancel
              </Button>
              <Button type="submit" form="edit-banner-form" disabled={updateMutation.isPending} className="rounded-xl px-4 py-2 text-sm text-white font-extrabold uppercase tracking-wider bg-[var(--gf-green-deep)] border-2 border-[var(--gf-green-deep)] shadow-[2px_2px_0_0_var(--gf-green-deep)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--gf-green-deep)] active:translate-y-[1px] active:shadow-[0_0_0_0_var(--gf-green-deep)] transition-all duration-200">
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
