import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { requestsService } from '@/services/requests.service';
import { FreeSessionRequest } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';

export function FreeSessionRequestsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { toast } = useToast();

  const { data, isLoading, error } = useApiQuery(
    ['requests', 'free-sessions', page.toString(), pageSize.toString()],
    () => requestsService.getFreeSessionRequests(page, pageSize)
  );

  const selectMutation = useApiMutation(
    ({ id, sessionId }: { id: string; sessionId?: string }) =>
      requestsService.selectFreeSessionRequest(id, sessionId),
    {
      invalidateQueries: [['requests', 'free-sessions']],
      onSuccess: () => {
        toast.success('Request selected successfully');
      },
      onError: error => {
        toast.error('Failed to select request', error.message);
      },
    }
  );

  const handleSelect = (request: FreeSessionRequest) => {
    selectMutation.mutate({ id: request.id });
  };

  const columns: ColumnDef<FreeSessionRequest>[] = [
    {
      accessorKey: 'parentName',
      header: 'Parent Name',
    },
    {
      accessorKey: 'kidName',
      header: 'Kid Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
    },
    {
      accessorKey: 'preferredDateTime',
      header: 'Preferred Date',
      cell: ({ row }) => {
        const date = row.original.preferredDateTime;
        return date ? formatDate(date) : '-';
      },
    },
    {
      accessorKey: 'locationId',
      header: 'Location',
      cell: ({ row }) => {
        // Handle both populated object and ID string
        const location = row.original.locationId as any;
        return location?.name || location || '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
        const request = row.original;
        return (
          <div className="flex items-center gap-2">
            {request.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(request)}
                disabled={selectMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Select
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {error ? (
        <ErrorState title="Failed to load free session requests" onRetry={() => window.location.reload()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No free session requests found"
          />
          {data && <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />}
        </>
      )}
    </div>
  );
}
