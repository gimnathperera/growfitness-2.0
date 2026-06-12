import { useEffect, useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { RequestSortField, SortOrder, requestsService } from '@/services/requests.service';
import { RescheduleRequest } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';

export function RescheduleRequestsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id as RequestSortField | undefined;
  const sortOrder = sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined;

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, error } = useApiQuery(
    ['requests', 'reschedule', page.toString(), pageSize.toString(), sortBy || '', sortOrder || ''],
    () =>
      requestsService.getRescheduleRequests(
        page,
        pageSize,
        sortBy,
        sortOrder as SortOrder | undefined
      )
  );

  const approveMutation = useApiMutation(
    (id: string) => requestsService.approveRescheduleRequest(id),
    {
      invalidateQueries: [['requests', 'reschedule']],
      onSuccess: () => {
        toast.success('Request approved successfully');
      },
      onError: error => {
        toast.error('Failed to approve request', error.message);
      },
    }
  );

  const denyMutation = useApiMutation((id: string) => requestsService.denyRescheduleRequest(id), {
    invalidateQueries: [['requests', 'reschedule']],
    onSuccess: () => {
      toast.success('Request denied');
    },
    onError: error => {
      toast.error('Failed to deny request', error.message);
    },
  });

  // Helper to get session ID from populated object or return ID
  const getSessionId = (sessionId: any): string => {
    if (!sessionId) return 'N/A';
    if (typeof sessionId === 'string') return sessionId;
    if (typeof sessionId === 'object' && sessionId.id) return sessionId.id;
    return 'N/A';
  };

  const columns: ColumnDef<RescheduleRequest>[] = [
    {
      accessorKey: 'sessionId',
      header: 'Session ID',
      cell: ({ row }) => getSessionId(row.original.sessionId),
    },
    {
      accessorKey: 'newDateTime',
      header: 'New Date & Time',
      cell: ({ row }) => formatDateTime(row.original.newDateTime),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
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
      enableSorting: false,
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-2">
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => approveMutation.mutate(request.id)}
                  disabled={approveMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => denyMutation.mutate(request.id)}
                  disabled={denyMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Deny
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {error ? (
        <ErrorState
          title="Failed to load reschedule requests"
          onRetry={() => window.location.reload()}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No reschedule requests found"
            manualSorting
            sorting={sorting}
            onSortingChange={setSorting}
          />
          {data && <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />}
        </>
      )}
    </div>
  );
}
