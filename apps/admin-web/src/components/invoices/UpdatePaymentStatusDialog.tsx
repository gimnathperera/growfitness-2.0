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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as CustomFormField } from '@/components/common/FormField';
import {
  UpdateInvoicePaymentStatusSchema,
  UpdateInvoicePaymentStatusDto,
} from '@grow-fitness/shared-schemas';
import { Invoice, InvoiceStatus } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { invoicesService } from '@/services/invoices.service';
import { useToast } from '@/hooks/useToast';

interface UpdatePaymentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function UpdatePaymentStatusDialog({
  open,
  onOpenChange,
  invoice,
}: UpdatePaymentStatusDialogProps) {
  const { toast } = useToast();

  const form = useForm<UpdateInvoicePaymentStatusDto>({
    resolver: zodResolver(UpdateInvoicePaymentStatusSchema),
    defaultValues: {
      status: invoice.status,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : undefined,
    },
  });

  const updateMutation = useApiMutation(
    (data: UpdateInvoicePaymentStatusDto) => invoicesService.updatePaymentStatus(invoice._id, data),
    {
      invalidateQueries: [['invoices']],
      onSuccess: () => {
        toast.success('Payment status updated successfully');
        onOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to update payment status', error.message);
      },
    }
  );

  const onSubmit = (data: UpdateInvoicePaymentStatusDto) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>Update invoice payment status</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField label="Status" required error={form.formState.errors.status?.message}>
            <Select
              value={form.watch('status')}
              onValueChange={value => form.setValue('status', value as InvoiceStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </CustomFormField>

          {form.watch('status') === InvoiceStatus.PAID && (
            <CustomFormField label="Paid At" error={form.formState.errors.paidAt?.message}>
              <input
                type="datetime-local"
                {...form.register('paidAt')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </CustomFormField>
          )}

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
