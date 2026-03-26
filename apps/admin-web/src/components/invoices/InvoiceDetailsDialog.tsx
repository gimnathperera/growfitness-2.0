import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Invoice } from '@grow-fitness/shared-types';
import { InvoiceType } from '@grow-fitness/shared-types';
import { useApiQuery } from '@/hooks/useApiQuery';
import { invoicesService } from '@/services/invoices.service';
import type { ApiError } from '@/services/api';
import { useModalParams } from '@/hooks/useModalParams';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/lib/formatters';
import { Download, Mail } from 'lucide-react';
import { InvoiceTemplatePrint, invoiceToPdfViewModel } from '@grow-fitness/invoice-print';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onPdfEmailed?: (invoiceId: string, pdfEmailedAt: Date) => void;
}

export function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice: invoiceProp,
  onPdfEmailed,
}: InvoiceDetailsDialogProps) {
  const { entityId, closeModal } = useModalParams('invoiceId');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const handleSendEmail = async () => {
    if (!invoice) return;
    setIsSending(true);
    try {
      const { pdfEmailedAt } = await invoicesService.sendInvoicePdfEmail(invoice.id);
      const at = new Date(pdfEmailedAt);
      onPdfEmailed?.(invoice.id, at);
      void queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice sent by email');
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as ApiError).message)
          : 'Send failed';
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  if (!invoice) {
    return null;
  }

  const recipientEmail =
    invoice.type === InvoiceType.PARENT_INVOICE
      ? invoice.parent?.email?.trim()
      : invoice.type === InvoiceType.COACH_PAYOUT
        ? invoice.coach?.email?.trim()
        : undefined;

  const pdfViewModel = invoiceToPdfViewModel(invoice);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b pl-6 pr-14 py-4 shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:justify-start">
            <DialogHeader className="space-y-1 text-left m-0 p-0 flex-1 min-w-0">
              <DialogTitle>Invoice</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDownloading || isSending}
                onClick={() => void handleDownload()}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading…' : 'Download PDF'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!recipientEmail || isSending || isDownloading}
                title={
                  !recipientEmail
                    ? 'No email on file for this customer or coach'
                    : `Send PDF to ${recipientEmail}`
                }
                onClick={() => void handleSendEmail()}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
          {recipientEmail ? (
            <p className="text-xs text-muted-foreground">
              Invoice PDF will be sent to {recipientEmail}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No email on file for this invoice recipient. Send is unavailable.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">PDF email:</span>
            {invoice.pdfEmailedAt ? (
              <span>Sent {formatDateTime(invoice.pdfEmailedAt)}</span>
            ) : (
              <Badge variant="outline" className="font-normal text-xs">
                Not sent yet
              </Badge>
            )}
          </div>
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
