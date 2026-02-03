interface InvoicesTableProps {
  data: Invoice[];
  isLoading?: boolean;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  allowEdit?: boolean;
}

export function InvoicesTable({
  data,
  isLoading,
  onView,
  onDownload,
  allowEdit = false,
}: InvoicesTableProps) {
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
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(invoice)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}

            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(invoice)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {allowEdit && (
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="No invoices found"
    />
  );
}
