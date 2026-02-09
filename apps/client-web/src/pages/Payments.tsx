import { useState, useEffect, useRef, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { invoicesService } from '@/services/invoices.service';
import { type Invoice, InvoiceStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatCurrency, formatInvoiceType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';
import { useAuth } from '@/contexts/useAuth';
import { useApiQuery } from '@/hooks/useApiQuery';
import { InvoiceDetailsDialog } from '@/components/invoice/InvoiceDetailsDialog';
import { InvoiceTemplate } from '@/components/invoice/InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createPortal } from 'react-dom';

export function Payments() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('invoiceId');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const loadedInvoiceId = useRef<string | null>(null);

  // 🔽 Download rendering state
  const [downloadInvoice, setDownloadInvoice] = useState<Invoice | null>(null);
  const [downloadType, setDownloadType] = useState<'pdf' | 'image'>('pdf');

  const { toast } = useToast();
  const { user } = useAuth();

  // Role-based filters
  const filters = useMemo(() => {
    if (!user) return {};
    if (user.role === 'PARENT') return { parentId: user.id };
    if (user.role === 'COACH') return { coachId: user.id };
    return {};
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    if (entityId && modal) {
      if (loadedInvoiceId.current !== entityId) {
        loadedInvoiceId.current = entityId;
        invoicesService
          .getInvoiceById(entityId)
          .then(res => {
            if (isMounted) setSelectedInvoice(res);
          })
          .catch(() => {
            closeModal();
            loadedInvoiceId.current = null;
          });
      }
    } else {
      setSelectedInvoice(null);
      loadedInvoiceId.current = null;
    }

    return () => {
      isMounted = false;
    };
  }, [entityId, modal, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;

  const { data, isLoading, error } = useApiQuery(
    ['invoices', page.toString(), pageSize.toString(), statusFilter, user?.id ?? '', user?.role ?? ''],
    () =>
      invoicesService.getInvoices(page, pageSize, {
        status: statusFilter || undefined,
        ...filters,
      })
  );

  // 🔽 Run download AFTER InvoiceTemplate is mounted
  useEffect(() => {
    if (!downloadInvoice) return;

    const runDownload = async () => {
      console.log('[Download] Template mounted');

      const element = document.getElementById('invoice-template');
      console.log('[Download] Template element:', element);

      if (!element) {
        toast.error('Invoice template not found');
        setDownloadInvoice(null);
        return;
      }

      try {
        const canvas = await html2canvas(element, { scale: 2 });
        console.log('[Download] Canvas created');

        if (downloadType === 'pdf') {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, width, height);
          pdf.save(`invoice-${downloadInvoice.id}.pdf`);
          console.log('[Download] PDF saved');
        } else {
          const imgURL = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = imgURL;
          a.download = `invoice-${downloadInvoice.id}.png`;
          a.click();
          console.log('[Download] Image saved');
        }

        toast.success('Invoice downloaded');
      } catch (err) {
        console.error('[Download] Error:', err);
        toast.error('Download failed');
      } finally {
        setDownloadInvoice(null);
      }
    };

    // allow one paint frame
    requestAnimationFrame(runDownload);
  }, [downloadInvoice, downloadType, toast]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatInvoiceType(row.original.type),
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
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log('[UI] View invoice', invoice.id);
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
                console.log('[UI] Download clicked', invoice.id);
                setDownloadType('pdf');
                setDownloadInvoice(invoice);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">View and download your invoices</p>
      </div>

      <FilterBar>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Status:</label>
          <Select
            value={statusFilter || 'all'}
            onValueChange={v =>
              setStatusFilter(v === 'all' ? '' : (v as InvoiceStatus))
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
      </FilterBar>

      {error ? (
        <ErrorState title="Failed to load invoices" onRetry={() => location.reload()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No invoices found"
          />
          {data && (
            <Pagination
              data={data}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}

      {selectedInvoice && (
        <InvoiceDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={closeModal}
          invoice={selectedInvoice}
        />
      )}

      {/* 🔽 Hidden render for download */}
      {downloadInvoice &&
        createPortal(
          <div style={{ position: 'fixed', top: '-9999px' }}>
            <InvoiceTemplate invoice={downloadInvoice} />
          </div>,
          document.body
        )}
    </div>
  );
}
