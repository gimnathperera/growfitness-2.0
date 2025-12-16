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

interface CreateBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBannerDialog({ open, onOpenChange }: CreateBannerDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateBannerDto>({
    resolver: zodResolver(CreateBannerSchema),
    defaultValues: {
      imageUrl: '',
      active: true,
      order: 0,
      targetAudience: BannerTargetAudience.ALL,
    },
  });

  const createMutation = useApiMutation(
    (data: CreateBannerDto) => bannersService.createBanner(data),
    {
      invalidateQueries: [['banners']],
      onSuccess: () => {
        toast.success('Banner created successfully');
        form.reset();
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to create banner', error.message);
      },
    }
  );

  const onSubmit = (data: CreateBannerDto) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Banner</DialogTitle>
          <DialogDescription>Add a new promotional banner</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
