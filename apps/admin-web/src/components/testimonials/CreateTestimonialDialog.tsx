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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { CreateTestimonialSchema, CreateTestimonialDto } from '@grow-fitness/shared-schemas';
import { useApiMutation } from '@/hooks/useApiMutation';
import { testimonialsService } from '@/services/testimonials.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTestimonialDialog({ open, onOpenChange }: CreateTestimonialDialogProps) {
  const { closeModal } = useModalParams('testimonialId');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  const { toast } = useToast();

  const defaultValues: CreateTestimonialDto = {
    authorName: '',
    content: '',
    childName: '',
    childAge: undefined,
    membershipDuration: '',
    rating: 5,
    order: 0,
    isActive: true,
  };

  const form = useForm<CreateTestimonialDto>({
    resolver: zodResolver(CreateTestimonialSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open]);

  const createMutation = useApiMutation(
    (data: CreateTestimonialDto) => testimonialsService.createTestimonial(data),
    {
      invalidateQueries: [['testimonials']],
      onSuccess: () => {
        toast.success('Testimonial created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create testimonial', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateTestimonialDto) => {
    createMutation.mutate({
      ...data,
      childName: data.childName || undefined,
      childAge: data.childAge ?? undefined,
      membershipDuration: data.membershipDuration || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 flex flex-col max-w-2xl max-h-[85vh]">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Testimonial</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new testimonial from a parent or customer
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="create-testimonial-form"
              className="grid grid-cols-2 gap-x-6 gap-y-4"
            >
              <CustomFormField
                label="Author Name"
                required
                error={form.formState.errors.authorName?.message}
              >
                <Input {...form.register('authorName')} placeholder="e.g. Sarah Johnson" />
              </CustomFormField>

              <CustomFormField
                label="Child Name"
                error={form.formState.errors.childName?.message}
              >
                <Input {...form.register('childName')} placeholder="e.g. Emma" />
              </CustomFormField>

              <CustomFormField
                label="Content"
                required
                error={form.formState.errors.content?.message}
                className="col-span-2"
              >
                <Textarea
                  {...form.register('content')}
                  placeholder="The testimonial text..."
                  rows={3}
                  className="resize-none"
                />
              </CustomFormField>

              <CustomFormField
                label="Child Age"
                error={form.formState.errors.childAge?.message}
              >
                <Input
                  type="number"
                  min={0}
                  max={18}
                  {...form.register('childAge', { valueAsNumber: true })}
                  placeholder="e.g. 8"
                />
              </CustomFormField>

              <CustomFormField
                label="Membership Duration"
                error={form.formState.errors.membershipDuration?.message}
              >
                <Input
                  {...form.register('membershipDuration')}
                  placeholder="e.g. Member for 6 months"
                />
              </CustomFormField>

              <CustomFormField label="Rating" error={form.formState.errors.rating?.message}>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...form.register('rating', { valueAsNumber: true })}
                />
              </CustomFormField>

              <CustomFormField label="Order" error={form.formState.errors.order?.message}>
                <Input type="number" min={0} {...form.register('order', { valueAsNumber: true })} />
              </CustomFormField>

              <CustomFormField
                label="Active"
                error={form.formState.errors.isActive?.message}
                className="col-span-2"
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.watch('isActive') ?? true}
                    onCheckedChange={checked => form.setValue('isActive', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    Show this testimonial on the website
                  </span>
                </div>
              </CustomFormField>
            </form>
          </div>

          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-testimonial-form"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Testimonial'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
