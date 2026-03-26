/** e.g. 25/03/2026 — fixed-width style common on formal invoices */
export function formatInvoiceDateSlash(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Currency as on sample: `LKR 12,345.67/-`
 * (Grouping with en-LK; tweak if your PDF uses different grouping.)
 */
export function formatLkrSlash(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `LKR ${formatted}/-`;
}
