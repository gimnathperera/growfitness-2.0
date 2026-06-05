import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks';
import { invoicesService, type InvoicePdfSentFilter } from '@/services/invoices.service';
import { Invoice, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { FilterBar } from '@/components/common/FilterBar';
import { ClearFiltersButton } from '@/components/common/ClearFiltersButton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, Eye, Pencil, Mail } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatInvoiceType,
} from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { CreateInvoiceDialog } from '@/components/invoices/CreateInvoiceDialog';
import { UpdatePaymentStatusDialog } from '@/components/invoices/UpdatePaymentStatusDialog';
import { InvoiceDetailsDialog } from '@/components/invoices/InvoiceDetailsDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';

export function InvoicesPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [typeFilter, setTypeFilter] = useState<InvoiceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [pdfSentFilter, setPdfSentFilter] = useState<InvoicePdfSentFilter | ''>('');

  const hasActiveFilters = Boolean(typeFilter || statusFilter || pdfSentFilter);

  const clearAllFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setPdfSentFilter('');
  };
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('invoiceId');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  // Sync selectedInvoice with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch invoice if we have ID in URL but no selectedInvoice
      if (!selectedInvoice || selectedInvoice.id !== entityId) {
        invoicesService
          .getInvoiceById(entityId)
          .then(response => {
            setSelectedInvoice(response);
          })
          .catch(() => {
            // Invoice not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedInvoice(null);
    }
  }, [entityId, modal, selectedInvoice, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const updateDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const recipientEmailFor = (inv: Invoice) =>
    inv.type === InvoiceType.PARENT_INVOICE
      ? inv.parent?.email?.trim()
      : inv.coach?.email?.trim();

  const pdfAlreadySentFor = (inv: Invoice) => Boolean(inv.pdfEmailedAt);

  const { data, isLoading, error } = useApiQuery(
    ['invoices', page.toString(), pageSize.toString(), typeFilter, statusFilter, pdfSentFilter],
    () =>
      invoicesService.getInvoices(page, pageSize, {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        pdfSent: pdfSentFilter || undefined,
      })
  );

  const handleExportCSV = async () => {
    try {
      const blob = await invoicesService.exportCSV({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        pdfSent: pdfSentFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoices exported successfully');
    } catch (error: any) {
      toast.error('Failed to export invoices', error.message);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
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

  const handleSendEmail = async (invoice: Invoice) => {
    const email = recipientEmailFor(invoice);
    const alreadySent = pdfAlreadySentFor(invoice);
    
    if (!email || alreadySent) return;

    setIsSending(true);
    try {
      await invoicesService.sendInvoicePdfEmail(invoice.id);
      toast.success('Invoice sent');
    } catch (err: any) {
      toast.error(err?.message || 'Send failed');
    } finally {
      setIsSending(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatInvoiceType(row.original.type),
    },
    {
      id: 'recipient',
      header: 'Name & email',
      cell: ({ row }) => {
        const inv = row.original;
        if (inv.type === InvoiceType.PARENT_INVOICE) {
          const name = inv.parent?.parentProfile?.name;
          const email = inv.parent?.email;
          return (
            <div className="min-w-[10rem] text-sm">
              <div className="font-medium">{name?.trim() || '—'}</div>
              <div className="text-muted-foreground break-all">{email || '—'}</div>
            </div>
          );
        }
        if (inv.type === InvoiceType.COACH_PAYOUT) {
          const name = inv.coach?.coachProfile?.name;
          const email = inv.coach?.email;
          return (
            <div className="min-w-[10rem] text-sm">
              <div className="font-medium">{name?.trim() || '—'}</div>
              <div className="text-muted-foreground break-all">{email || '—'}</div>
            </div>
          );
        }
        return <span className="text-sm text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'pdfEmailedAt',
      header: 'PDF emailed',
      cell: ({ row }) => {
        const at = row.original.pdfEmailedAt;
        return at ? (
          <span className="text-sm text-muted-foreground">{formatDateTime(at)}</span>
        ) : (
          <Badge variant="outline" className="font-normal">
            Not sent
          </Badge>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!recipientEmailFor(invoice) || isSending || isDownloading || pdfAlreadySentFor(invoice)}
              onClick={() => handleSendEmail(invoice)}
            >
              <Mail className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleDownload(invoice)}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedInvoice(invoice);
                openModal(invoice.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedInvoice(invoice);
                openModal(invoice.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground mt-1">Manage invoices and payments</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Type:</label>
            <Select
              value={typeFilter || 'all'}
              onValueChange={value =>
                setTypeFilter(value === 'all' ? '' : (value as InvoiceType))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value={InvoiceType.PARENT_INVOICE}>Parent Invoice</SelectItem>
                <SelectItem value={InvoiceType.COACH_PAYOUT}>Coach Payout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Select
              value={statusFilter || 'all'}
              onValueChange={value =>
                setStatusFilter(value === 'all' ? '' : (value as InvoiceStatus))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">PDF emailed:</label>
            <Select
              value={pdfSentFilter || 'all'}
              onValueChange={value =>
                setPdfSentFilter(
                  value === 'all' ? '' : (value as InvoicePdfSentFilter)
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="not_sent">Not sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ClearFiltersButton onClear={clearAllFilters} disabled={!hasActiveFilters} />
        </FilterBar>

        {error ? (
          <ErrorState title="Failed to load invoices" onRetry={() => window.location.reload()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No invoices found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateInvoiceDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedInvoice || entityId) && (
        <>
          <UpdatePaymentStatusDialog
            open={updateDialogOpen}
            onOpenChange={closeModal}
            invoice={selectedInvoice || undefined}
          />
          <InvoiceDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={closeModal}
            invoice={selectedInvoice || undefined}
            onPdfEmailed={(invoiceId, pdfEmailedAt) => {
              setSelectedInvoice(prev =>
                prev?.id === invoiceId ? { ...prev, pdfEmailedAt } : prev
              );
            }}
          />
        </>
      )}
    </div>
  );
}
