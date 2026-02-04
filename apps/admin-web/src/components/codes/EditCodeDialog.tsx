import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { UpdateCodeDto, Code } from '@/services/codes.service';
import { useApiMutation } from '@/hooks/useApiMutation';
import { codesService } from '@/services/codes.service';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useModalParams } from '@/hooks/useModalParams';

interface EditCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code?: Code;
}

function getDateValue(date: Date | string | null | undefined): Date | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return undefined;
  return d;
}

export function EditCodeDialog({ open, onOpenChange, code: codeProp }: EditCodeDialogProps) {
  const { entityId, closeModal } = useModalParams('codeId');
  
  // Fetch code from URL if prop not provided
  const { data: codeFromUrl } = useApiQuery<Code>(
    ['codes', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Code ID is required');
      }
      return codesService.getCodeById(entityId);
    },
    {
      enabled: open && !codeProp && !!entityId,
    }
  );

  const code = codeProp || codeFromUrl;

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  if (!code) {
    return null;
  }
  const { toast } = useToast();

  const form = useForm<UpdateCodeDto>({
    defaultValues: {
      status: code.status,
      expiryDate: code.expiryDate ? format(getDateValue(code.expiryDate)!, "yyyy-MM-dd'T'HH:mm") : undefined,
      usageLimit: code.usageLimit,
      description: code.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        status: code.status,
        expiryDate: code.expiryDate ? format(getDateValue(code.expiryDate)!, "yyyy-MM-dd'T'HH:mm") : undefined,
        usageLimit: code.usageLimit,
        description: code.description || '',
      });
    }
  }, [open, code, form]);

  const updateMutation = useApiMutation(
    (data: UpdateCodeDto) => codesService.updateCode(code.id, data),
    {
      invalidateQueries: [['codes']],
      onSuccess: () => {
        toast.success('Code updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update code', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateCodeDto) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Edit Code</DialogTitle>
              <DialogDescription className="text-sm">Update code information</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-code-form" className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Code</label>
            <p className="text-sm font-mono mt-1">{code.code}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <p className="text-sm mt-1">{code.type}</p>
          </div>

          <CustomFormField label="Status" error={form.formState.errors.status?.message}>
            <Select
              value={form.watch('status')}
              onValueChange={value => form.setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </CustomFormField>

          <CustomFormField
            label="Usage Limit"
            error={form.formState.errors.usageLimit?.message}
          >
            <Input
              type="number"
              min="1"
              {...form.register('usageLimit', {
                valueAsNumber: true,
                min: { value: 1, message: 'Usage limit must be at least 1' },
              })}
            />
          </CustomFormField>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Usage Count</label>
            <p className="text-sm mt-1">{code.usageCount} / {code.usageLimit}</p>
          </div>

          <CustomFormField
            label="Expiry Date"
            error={form.formState.errors.expiryDate?.message}
          >
            <DateTimePicker
              date={(() => {
                const expiryDate = form.watch('expiryDate');
                if (expiryDate) {
                  return typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
                }
                return getDateValue(code.expiryDate);
              })()}
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
              <Button type="submit" form="edit-code-form" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

