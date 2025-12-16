import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { invoicesService } from '@/services/invoices.service';
import { Invoice, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
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
import { Plus, Download, Eye, Pencil } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import {
  formatDate,
  formatCurrency,
  formatInvoiceType,
  formatInvoiceStatus,
} from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateInvoiceDialog } from '@/components/invoices/CreateInvoiceDialog';
import { UpdatePaymentStatusDialog } from '@/components/invoices/UpdatePaymentStatusDialog';
import { InvoiceDetailsDialog } from '@/components/invoices/InvoiceDetailsDialog';

export function InvoicesPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [typeFilter, setTypeFilter] = useState<InvoiceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useApiQuery(
    ['invoices', page.toString(), pageSize.toString(), typeFilter, statusFilter],
    () =>
      invoicesService.getInvoices(page, pageSize, {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      })
  );

  const handleExportCSV = async () => {
    try {
      const blob = await invoicesService.exportCSV({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
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
                setDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedInvoice(invoice);
                setUpdateDialogOpen(true);
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
        <div className="flex items-center justify-between">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Type:</label>
            <Select
              value={typeFilter}
              onValueChange={value => setTypeFilter(value as InvoiceType | '')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value={InvoiceType.PARENT_INVOICE}>Parent Invoice</SelectItem>
                <SelectItem value={InvoiceType.COACH_PAYOUT}>Coach Payout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as InvoiceStatus | '')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {error ? (
          <div>Error loading invoices</div>
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

      <CreateInvoiceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedInvoice && (
        <>
          <UpdatePaymentStatusDialog
            open={updateDialogOpen}
            onOpenChange={setUpdateDialogOpen}
            invoice={selectedInvoice}
          />
          <InvoiceDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            invoice={selectedInvoice}
          />
        </>
      )}
    </div>
  );
}
