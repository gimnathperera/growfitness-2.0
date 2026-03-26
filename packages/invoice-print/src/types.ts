/**
 * View model for the Grow Fitness invoice HTML/PDF template.
 * Bind from API `Invoice` via {@link invoiceToPdfViewModel}.
 */
export interface InvoicePdfViewModel {
  invoiceToLabel: string;
  invoiceTo: string;
  /** Shown when `showKidsRow` is true (parent invoices). */
  kidsName: string;
  showKidsRow: boolean;
  issueDate: string;
  validTill: string;
  bankReference: string;
  items: Array<{ description: string; amount: number }>;
  /** Total from persisted invoice (authoritative). */
  totalAmount: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankBranch: string;
  };
}
