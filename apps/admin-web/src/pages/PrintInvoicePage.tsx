import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Invoice } from '@grow-fitness/shared-types';
import { InvoiceTemplatePrint, invoiceToPdfViewModel } from '@grow-fitness/invoice-print';
import { invoicesService } from '@/services/invoices.service';
import { Button } from '@/components/ui/button';

/**
 * Dedicated print route: same HTML as Puppeteer PDF (see GET /invoices/:id/pdf).
 * Open from admin: `/print/invoice/{invoiceId}` while logged in.
 */
export function PrintInvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setError('Missing invoice id');
      return;
    }
    invoicesService
      .getInvoiceById(invoiceId)
      .then(setInvoice)
      .catch(() => setError('Failed to load invoice'));
  }, [invoiceId]);

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  const viewModel = invoiceToPdfViewModel(invoice);

  return (
    <div className="min-h-screen bg-muted/40 p-6 print:bg-transparent print:p-0">
      <div className="mx-auto max-w-[210mm] overflow-hidden rounded-md shadow-md ring-1 ring-black/10 print:shadow-none print:ring-0 print:rounded-none">
        <div className="mb-4 flex flex-wrap gap-2 p-4 print:hidden">
          <Button type="button" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
        <InvoiceTemplatePrint data={viewModel} />
      </div>
    </div>
  );
}
