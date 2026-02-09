import { formatCurrency, formatDate, formatInvoiceType } from '@/lib/formatters';
import type { Invoice, User } from '@grow-fitness/shared-types';

interface InvoiceTemplateProps {
  invoice: Invoice & {
    parent?: Pick<User, 'email'>;
    coach?: Pick<User, 'email'>;
  };
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  return (
    <div
      id="invoice-template"
      style={{
        width: '800px',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
        color: '#000',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Invoice</h1>
      <p><strong>Invoice ID:</strong> {invoice.id}</p>
      <p><strong>Type:</strong> {formatInvoiceType(invoice.type)}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      <p><strong>Parent:</strong> {invoice.parent?.email || invoice.parentId}</p>
      <p><strong>Created:</strong> {formatDate(invoice.createdAt)}</p>
      <p><strong>Due:</strong> {formatDate(invoice.dueDate)}</p>

      <h2 style={{ marginTop: '20px' }}>Items</h2>
      <ul>
        {invoice.items?.map(item => (
          <li key={item.description}>
            {item.description} — {formatCurrency(item.amount)}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: '20px' }}>Total: {formatCurrency(invoice.totalAmount)}</h3>
    </div>
  );
}
