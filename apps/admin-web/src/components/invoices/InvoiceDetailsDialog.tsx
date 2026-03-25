import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Invoice } from '@grow-fitness/shared-types';
import { useApiQuery } from '@/hooks/useApiQuery';
import { invoicesService } from '@/services/invoices.service';
import { useModalParams } from '@/hooks/useModalParams';
import { useToast } from '@/hooks/useToast';
import { Download } from 'lucide-react';
import { InvoiceTemplatePrint, invoiceToPdfViewModel } from '@grow-fitness/invoice-print';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
}

export function InvoiceDetailsDialog({ open, onOpenChange, invoice: invoiceProp }: InvoiceDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('invoiceId');
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: invoiceFromUrl } = useApiQuery<Invoice>(
    ['invoices', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Invoice ID is required');
      }
      return invoicesService.getInvoiceById(entityId);
    },
    {
      enabled: open && !invoiceProp && !!entityId,
    }
  );

  const invoice = invoiceProp || invoiceFromUrl;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  const handleDownload = async () => {
    if (!invoice) return;
    setIsDownloading(true);
    try {
      const blob = await invoicesService.downloadInvoicePdf(invoice.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!invoice) {
    return null;
  }

  const pdfViewModel = invoiceToPdfViewModel(invoice);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b pl-6 pr-14 py-4 sm:flex-row sm:items-center sm:gap-4 sm:justify-start shrink-0">
          <DialogHeader className="space-y-1 text-left m-0 p-0 flex-1 min-w-0">
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Preview matches server PDF (Puppeteer + HTML template)</DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 self-start sm:self-center"
            disabled={isDownloading}
            onClick={() => void handleDownload()}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading…' : 'Download PDF'}
          </Button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-auto bg-muted/40 p-4">
          <div className="mx-auto w-full max-w-[210mm] shrink-0 overflow-hidden rounded-md shadow-md ring-1 ring-black/10">
            <InvoiceTemplatePrint data={pdfViewModel} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
