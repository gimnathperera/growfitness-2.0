import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { FormField as CustomFormField } from '@/components/common/FormField';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { CreateCodeDto } from '@/services/codes.service';
import { useApiMutation } from '@/hooks/useApiMutation';
import { codesService } from '@/services/codes.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';
import { format } from 'date-fns';

// Create Code Schema
const CreateCodeSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    type: z.enum(['DISCOUNT', 'PROMO', 'REFERRAL']),
    discountPercentage: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    expiryDate: z.string().optional(),
    usageLimit: z.number().min(1, 'Usage limit must be at least 1'),
    description: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'DISCOUNT') {
        return !!(data.discountPercentage || data.discountAmount);
      }
      return true;
    },
    {
      message: 'Either discount percentage or amount is required for discount codes',
      path: ['discountPercentage'],
    }
  );

interface CreateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCodeDialog({ open, onOpenChange }: CreateCodeDialogProps) {
  const { closeModal } = useModalParams('codeId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const defaultValues = {
    code: '',
    type: 'DISCOUNT' as const,
    discountPercentage: undefined,
    discountAmount: undefined,
    expiryDate: undefined,
    usageLimit: 1,
    description: undefined,
  };

  const form = useForm<CreateCodeDto>({
    resolver: zodResolver(CreateCodeSchema),
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
    (data: CreateCodeDto) => codesService.createCode(data),
    {
      invalidateQueries: [['codes']],
      onSuccess: () => {
        toast.success('Code created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create code', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateCodeDto) => {
    // Convert code to uppercase
    const submitData: CreateCodeDto = {
      ...data,
      code: data.code.toUpperCase(),
    };
    createMutation.mutate(submitData);
  };

  const codeType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Code</DialogTitle>
              <DialogDescription className="text-sm">Add a new promotional or discount code</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-code-form" className="space-y-4">
          <CustomFormField
            label="Code"
            required
            error={form.formState.errors.code?.message}
          >
            <Input {...form.register('code')} placeholder="SUMMER2024" />
          </CustomFormField>

          <CustomFormField label="Type" required error={form.formState.errors.type?.message}>
            <Select
              value={form.watch('type')}
              onValueChange={value => {
                form.setValue('type', value);
                // Clear discount fields when type changes
                if (value !== 'DISCOUNT') {
                  form.setValue('discountPercentage', undefined);
                  form.setValue('discountAmount', undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCOUNT">Discount</SelectItem>
                <SelectItem value="PROMO">Promo</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
              </SelectContent>
            </Select>
          </CustomFormField>

          {codeType === 'DISCOUNT' && (
            <>
              <CustomFormField
                label="Discount Percentage (%)"
                error={form.formState.errors.discountPercentage?.message}
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...form.register('discountPercentage', { valueAsNumber: true })}
                  placeholder="10"
                />
              </CustomFormField>

              <CustomFormField
                label="Discount Amount ($)"
                error={form.formState.errors.discountAmount?.message}
              >
                <Input
                  type="number"
                  min="0"
                  {...form.register('discountAmount', { valueAsNumber: true })}
                  placeholder="50"
                />
              </CustomFormField>
            </>
          )}

          <CustomFormField label="Usage Limit" required error={form.formState.errors.usageLimit?.message}>
            <Input type="number" min="1" {...form.register('usageLimit', { valueAsNumber: true })} />
          </CustomFormField>

          <CustomFormField
            label="Expiry Date"
            error={form.formState.errors.expiryDate?.message}
          >
            <DateTimePicker
              date={
                (() => {
                  const expiryDate = form.watch('expiryDate');
                  if (!expiryDate) return undefined;
                  if (typeof expiryDate === 'string') {
                    return new Date(expiryDate);
                  }
                  return expiryDate;
                })()
              }
              onSelect={date => {
                if (date) {
                  // Format as ISO string for the API (yyyy-MM-ddTHH:mm format)
                  form.setValue('expiryDate', format(date, "yyyy-MM-dd'T'HH:mm"));
                } else {
                  form.setValue('expiryDate', undefined);
                }
              }}
              placeholder="Pick expiry date and time"
            />
          </CustomFormField>

          <CustomFormField
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <Textarea {...form.register('description')} rows={3} />
          </CustomFormField>

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-code-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Code'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

