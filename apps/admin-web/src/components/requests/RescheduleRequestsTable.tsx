import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { requestsService } from '@/services/requests.service';
import { RescheduleRequest } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';

export function RescheduleRequestsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { toast } = useToast();

  const { data, isLoading, error } = useApiQuery(
    ['requests', 'reschedule', page.toString(), pageSize.toString()],
    () => requestsService.getRescheduleRequests(page, pageSize)
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

  const columns: ColumnDef<RescheduleRequest>[] = [
    {
      accessorKey: 'sessionId',
      header: 'Session ID',
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
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center gap-2">
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => approveMutation.mutate(request._id)}
                  disabled={approveMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => denyMutation.mutate(request._id)}
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
        <div>Error loading requests</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No reschedule requests found"
          />
          {data && <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />}
        </>
      )}
    </div>
  );
}
