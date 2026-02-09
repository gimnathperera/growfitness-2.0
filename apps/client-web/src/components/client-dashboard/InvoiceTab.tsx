import { useState } from "react";
import { type Invoice, InvoiceType, InvoiceStatus } from "@grow-fitness/shared-types";
import { useApiQuery } from "@/hooks/useApiQuery";
import { invoicesService } from "@/services/invoices.service";

import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { formatDate, formatCurrency, formatInvoiceType } from "@/lib/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { usePagination } from "@/hooks/usePagination";
import { InvoiceDetailsDialog } from "../invoice/InvoiceDetailsDialog";

interface KidInvoicesTabProps {
  kidId: string;
}

export function InvoicesTab({ kidId }: KidInvoicesTabProps) {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading, error } = useApiQuery(
    ["kid-invoices", kidId, page.toString(), pageSize.toString()],
    () => invoicesService.getInvoices(page, pageSize, { parentId: kidId })
  );

  const handleDownload = async (invoice: Invoice) => {
    try {
      const blob = await invoicesService.exportCSV({ parentId: invoice.id });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.id}.csv`;  // Note the .csv extension
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Error handled silently
    }
  };

  const columns = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: { row: { original: Invoice } }) => formatInvoiceType(row.original.type as InvoiceType),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }: { row: { original: Invoice } }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Invoice } }) => <StatusBadge status={row.original.status as InvoiceStatus} />,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: { row: { original: Invoice } }) => formatDate(row.original.dueDate),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: { original: Invoice } }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Invoice } }) => {
        const invoice = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedInvoice(invoice);
                setDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(invoice)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return <ErrorState title="Failed to load invoices" onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      {data && (
        <Pagination
          data={data}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          invoice={selectedInvoice}
        />
      )}
    </>
  );
}
