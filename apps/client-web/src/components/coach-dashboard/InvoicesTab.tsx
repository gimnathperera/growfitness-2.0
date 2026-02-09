import { useState, useEffect, useRef } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { invoicesService } from '@/services/invoices.service';
import { type Invoice, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
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
import { Download, Eye, Pencil } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';

import {
  formatDate,
  formatCurrency,
  formatInvoiceType,
} from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';
import { useAuth } from '@/contexts/useAuth';
import { InvoiceDetailsDialog } from '../invoice/InvoiceDetailsDialog';
import { useApiQuery } from '@/hooks/useApiQuery';

export function InvoicesTab() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [typeFilter] = useState<InvoiceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('invoiceId');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const loadedInvoiceId = useRef<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const coachId = user?.id;

  useEffect(() => {
    let isMounted = true;

    if (entityId && modal) {
      if (loadedInvoiceId.current !== entityId) {
        loadedInvoiceId.current = entityId;
        invoicesService
          .getInvoiceById(entityId)
          .then(response => {
            if (isMounted) {
              setSelectedInvoice(response);
            }
          })
          .catch(() => {
            if (isMounted) {
              closeModal();
              loadedInvoiceId.current = null;
            }
          });
      }
    } else if (!entityId && !modal) {
      // Use setTimeout to defer the state update
      const timer = setTimeout(() => {
        if (isMounted) {
          setSelectedInvoice(null);
          loadedInvoiceId.current = null;
        }
      }, 0);
      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [entityId, modal, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;

  const { data, isLoading, error } = useApiQuery(
    ['invoices', page.toString(), pageSize.toString(), typeFilter, statusFilter, coachId || ''],
    () =>
      invoicesService.getInvoices(page, pageSize, {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        coachId, 
      })
  );

  const handleExportCSV = async () => {
    try {
      const blob = await invoicesService.exportCSV({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        coachId, 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoices exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to export invoices: ${errorMessage}`);
    }
  };

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
        </div>

        <FilterBar>
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

     {(selectedInvoice || entityId) && (
        <>
            {selectedInvoice && (
            <InvoiceDetailsDialog
                open={detailsDialogOpen}
                onOpenChange={closeModal}
                invoice={selectedInvoice}
            />
            )}
        </>
     )}
    </div>
  );
}
