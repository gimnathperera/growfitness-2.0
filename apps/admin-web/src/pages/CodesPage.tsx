import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { codesService, Code } from '@/services/codes.service';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { CreateCodeDialog } from '@/components/codes/CreateCodeDialog';
import { EditCodeDialog } from '@/components/codes/EditCodeDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { ErrorState } from '@/components/common/ErrorState';
import { Badge } from '@/components/ui/badge';
import { useModalParams } from '@/hooks/useModalParams';

function formatCodeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    EXPIRED: 'Expired',
  };
  return statusMap[status] || status;
}

function formatCodeType(type: string): string {
  const typeMap: Record<string, string> = {
    DISCOUNT: 'Discount',
    PROMO: 'Promo',
    REFERRAL: 'Referral',
  };
  return typeMap[type] || type;
}

function formatDiscount(code: Code): string {
  if (code.discountPercentage) {
    return `${code.discountPercentage}%`;
  }
  if (code.discountAmount) {
    return `$${code.discountAmount.toFixed(2)}`;
  }
  return '-';
}

export function CodesPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('codeId');
  const [selectedCode, setSelectedCode] = useState<Code | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Sync selectedCode with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch code if we have ID in URL but no selectedCode
      if (!selectedCode || selectedCode.id !== entityId) {
        codesService
          .getCodeById(entityId)
          .then(response => {
            setSelectedCode(response);
          })
          .catch(() => {
            // Code not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedCode(null);
    }
  }, [entityId, modal, selectedCode, closeModal]);

  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const { data, isLoading, error } = useApiQuery(
    ['codes', page.toString(), pageSize.toString()],
    () => codesService.getCodes(page, pageSize)
  );

  const deleteMutation = useApiMutation((id: string) => codesService.deleteCode(id), {
    invalidateQueries: [['codes']],
    onSuccess: () => {
      toast.success('Code deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete code', error.message);
    },
  });

  const handleDelete = async (code: Code) => {
    const confirmed = await confirm({
      title: 'Delete Code',
      description: `Are you sure you want to delete code ${code.code}? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(code.id);
    }
  };

  const columns: ColumnDef<Code>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatCodeType(row.original.type),
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row }) => formatDiscount(row.original),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === 'ACTIVE' ? 'default' : status === 'EXPIRED' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{formatCodeStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: 'usage',
      header: 'Usage',
      cell: ({ row }) => `${row.original.usageCount} / ${row.original.usageLimit}`,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => (row.original.expiryDate ? formatDate(row.original.expiryDate) : '-'),
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
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedCode(code);
                openModal(code.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(code)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Codes</h1>
        <p className="text-muted-foreground mt-1">Manage promotional and discount codes</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Code
          </Button>
        </div>

        {error ? (
          <ErrorState title="Failed to load codes" onRetry={() => window.location.reload()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No codes found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateCodeDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedCode || entityId) && (
        <EditCodeDialog
          open={editDialogOpen}
          onOpenChange={closeModal}
          code={selectedCode || undefined}
        />
      )}

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={open => {
          if (!open) confirmState.onCancel();
        }}
        title={confirmState.options?.title || ''}
        description={confirmState.options?.description || ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        variant={confirmState.options?.variant}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}
