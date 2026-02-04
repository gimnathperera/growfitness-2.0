import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { CreateInvoiceSchema, CreateInvoiceDto } from '@grow-fitness/shared-schemas';
import { InvoiceType } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { invoicesService } from '@/services/invoices.service';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import { format } from 'date-fns';
import { useModalParams } from '@/hooks/useModalParams';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const { closeModal } = useModalParams('invoiceId');

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };
  const { toast } = useToast();

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 100)
  );

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const defaultValues = {
    type: InvoiceType.PARENT_INVOICE,
    items: [{ description: '', amount: 0 }],
    dueDate: '',
  };

  const form = useForm<CreateInvoiceDto>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
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
    (data: CreateInvoiceDto) => invoicesService.createInvoice(data),
    {
      invalidateQueries: [['invoices']],
      onSuccess: () => {
        toast.success('Invoice created successfully');
        form.reset(defaultValues);
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      },
      onError: error => {
        toast.error('Failed to create invoice', error.message || 'An error occurred');
      },
    }
  );

  const onSubmit = (data: CreateInvoiceDto) => {
    const formattedData = {
      ...data,
      dueDate:
        typeof data.dueDate === 'string'
          ? data.dueDate
          : format(data.dueDate as Date, 'yyyy-MM-dd'),
    };
    createMutation.mutate(formattedData);
  };

  const invoiceType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1 px-6 pt-6">
              <DialogTitle className="text-xl">Create Invoice</DialogTitle>
              <DialogDescription className="text-sm">Add a new invoice</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-invoice-form" className="space-y-4">
          <CustomFormField label="Type" required error={form.formState.errors.type?.message}>
            <Select
              value={form.watch('type')}
              onValueChange={value => {
                form.setValue('type', value as InvoiceType);
                form.setValue('parentId', undefined);
                form.setValue('coachId', undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceType.PARENT_INVOICE}>Parent Invoice</SelectItem>
                <SelectItem value={InvoiceType.COACH_PAYOUT}>Coach Payout</SelectItem>
              </SelectContent>
            </Select>
          </CustomFormField>

          {invoiceType === InvoiceType.PARENT_INVOICE && (
            <CustomFormField
              label="Parent"
              required
              error={form.formState.errors.parentId?.message}
            >
              <Select
                value={form.watch('parentId') || ''}
                onValueChange={value => form.setValue('parentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {(parentsData?.data || []).map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.parentProfile?.name || parent.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CustomFormField>
          )}

          {invoiceType === InvoiceType.COACH_PAYOUT && (
            <CustomFormField label="Coach" required error={form.formState.errors.coachId?.message}>
              <Select
                value={form.watch('coachId') || ''}
                onValueChange={value => form.setValue('coachId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coach" />
                </SelectTrigger>
                <SelectContent>
                  {(coachesData?.data || []).map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.coachProfile?.name || coach.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CustomFormField>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Items</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder="Description"
                  {...form.register(`items.${index}.description`)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  {...form.register(`items.${index}.amount`, { valueAsNumber: true })}
                  className="w-32"
                />
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ description: '', amount: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <CustomFormField label="Due Date" required error={form.formState.errors.dueDate?.message}>
            <DatePicker
              date={form.watch('dueDate') ? new Date(form.watch('dueDate')) : undefined}
              onSelect={date => form.setValue('dueDate', date ? format(date, 'yyyy-MM-dd') : '')}
            />
          </CustomFormField>

            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-invoice-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
