import type { Invoice } from '@grow-fitness/shared-types';
import { InvoiceType } from '@grow-fitness/shared-types';
import type { InvoicePdfViewModel } from './types';
import { DEFAULT_BANK_DETAILS } from './bank-constants';
import { formatInvoiceDateSlash } from './format';

function kidNameFromInvoice(invoice: Invoice): string {
  const raw = invoice.exportFields?.kidName;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
}

export function invoiceToPdfViewModel(invoice: Invoice): InvoicePdfViewModel {
  const isParent = invoice.type === InvoiceType.PARENT_INVOICE;
  const invoiceTo = isParent
    ? invoice.parent?.parentProfile?.name?.trim() || '—'
    : invoice.coach?.coachProfile?.name?.trim() || '—';
  const kidsName = kidNameFromInvoice(invoice);

  return {
    invoiceToLabel: isParent ? 'Invoice to' : 'Pay to',
    invoiceTo,
    kidsName: kidsName || '—',
    showKidsRow: isParent,
    issueDate: formatInvoiceDateSlash(invoice.createdAt),
    validTill: formatInvoiceDateSlash(invoice.dueDate),
    bankReference: invoice.id,
    items: invoice.items.map(i => ({ description: i.description, amount: i.amount })),
    totalAmount: invoice.totalAmount,
    bankDetails: { ...DEFAULT_BANK_DETAILS },
  };
}
