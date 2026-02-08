import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Invoice } from '@grow-fitness/shared-types';
import { formatDate, formatCurrency, formatInvoiceType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function InvoiceDetailsDialog({ open, onOpenChange, invoice }: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>View invoice information</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
            <p className="text-sm font-medium">{formatInvoiceType(invoice.type)}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <StatusBadge status={invoice.status} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
            <p className="text-sm font-medium">{formatCurrency(invoice.totalAmount)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
            <p className="text-sm">{formatDate(invoice.dueDate)}</p>
          </div>

          {invoice.paidAt && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Paid At</h3>
              <p className="text-sm">{formatDate(invoice.paidAt)}</p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Items</h3>
            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between p-2 border rounded">
                  <span className="text-sm">{item.description}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
