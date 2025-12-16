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

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const { toast } = useToast();

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 1000)
  );

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 1000)
  );

  const form = useForm<CreateInvoiceDto>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      type: InvoiceType.PARENT_INVOICE,
      items: [{ description: '', amount: 0 }],
      dueDate: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createMutation = useApiMutation(
    (data: CreateInvoiceDto) => invoicesService.createInvoice(data),
    {
      invalidateQueries: [['invoices']],
      onSuccess: () => {
        toast.success('Invoice created successfully');
        form.reset();
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to create invoice', error.message);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Add a new invoice</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  {parentsData?.data.map(parent => (
                    <SelectItem key={parent._id} value={parent._id}>
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
                  {coachesData?.data.map(coach => (
                    <SelectItem key={coach._id} value={coach._id}>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
