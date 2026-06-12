import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { RequestSortField, SortOrder, requestsService } from '@/services/requests.service';
import { usersService } from '@/services/users.service';
import { ExtraSessionRequest, type User } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, X } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateTime, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';

type MongoCoachRef = {
  _id?: unknown;
  id?: unknown;
  coachProfile?: { name?: string };
  email?: string;
};

function getCoachIdFromRow(coachField: unknown): string {
  if (!coachField) return '';
  if (typeof coachField === 'string') return coachField;
  if (typeof coachField === 'object' && coachField !== null) {
    const o = coachField as MongoCoachRef;
    if (o._id != null) return String(o._id);
    if (o.id != null) return String(o.id);
  }
  return '';
}

function getCoachDisplayName(coachField: unknown): string {
  if (!coachField) return 'Not assigned';
  if (typeof coachField === 'string') return '—';
  if (typeof coachField === 'object' && coachField !== null) {
    const c = coachField as MongoCoachRef;
    if (c.coachProfile?.name) return c.coachProfile.name;
    if (c.email) return c.email;
  }
  return '—';
}

export function ExtraSessionRequestsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { toast } = useToast();

  const [approveTarget, setApproveTarget] = useState<ExtraSessionRequest | null>(null);
  const [approveCoachId, setApproveCoachId] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id as RequestSortField | undefined;
  const sortOrder = sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined;

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, error } = useApiQuery(
    [
      'requests',
      'extra-sessions',
      page.toString(),
      pageSize.toString(),
      sortBy || '',
      sortOrder || '',
    ],
    () =>
      requestsService.getExtraSessionRequests(
        page,
        pageSize,
        sortBy,
        sortOrder as SortOrder | undefined
      )
  );

  const { data: coachesRes } = useApiQuery(['users', 'coaches', 'assign-extra-session'], () =>
    usersService.getCoaches(1, 100)
  );
  const coaches: User[] = coachesRes?.data ?? [];

  const assignCoachMutation = useApiMutation(
    ({ id, coachId }: { id: string; coachId: string }) =>
      requestsService.updateExtraSessionRequest(id, { coachId }),
    {
      invalidateQueries: [['requests', 'extra-sessions']],
      onSuccess: () => {
        toast.success('Coach assigned');
      },
      onError: err => {
        toast.error('Failed to assign coach', err.message);
      },
    }
  );

  const approveMutation = useApiMutation(
    ({ id, coachId }: { id: string; coachId: string }) =>
      requestsService.approveExtraSessionRequest(id, { coachId }),
    {
      invalidateQueries: [['requests', 'extra-sessions']],
      onSuccess: () => {
        toast.success('Request approved successfully');
        setApproveTarget(null);
        setApproveCoachId('');
      },
      onError: error => {
        toast.error('Failed to approve request', error.message);
      },
    }
  );

  const denyMutation = useApiMutation((id: string) => requestsService.denyExtraSessionRequest(id), {
    invalidateQueries: [['requests', 'extra-sessions']],
    onSuccess: () => {
      toast.success('Request denied');
    },
    onError: error => {
      toast.error('Failed to deny request', error.message);
    },
  });

  const openApproveDialog = useCallback((request: ExtraSessionRequest) => {
    setApproveTarget(request);
    setApproveCoachId(getCoachIdFromRow(request.coachId));
  }, []);

  const closeApproveDialog = useCallback(() => {
    setApproveTarget(null);
    setApproveCoachId('');
  }, []);

  const getParentName = (parentId: unknown): string => {
    if (!parentId) return 'N/A';
    if (typeof parentId === 'string') return parentId;
    if (typeof parentId === 'object') {
      const p = parentId as { parentProfile?: { name?: string }; email?: string };
      if (p.parentProfile?.name) return p.parentProfile.name;
      if (p.email) return p.email;
    }
    return 'N/A';
  };

  const getKidName = (kidId: unknown): string => {
    if (!kidId) return 'N/A';
    if (typeof kidId === 'string') return kidId;
    if (typeof kidId === 'object' && kidId !== null && 'name' in kidId) {
      return String((kidId as { name: string }).name);
    }
    return 'N/A';
  };

  const columns: ColumnDef<ExtraSessionRequest>[] = useMemo(
    () => [
      {
        id: 'parent',
        accessorFn: row => getParentName(row.parentId),
        header: 'Parent Name',
        cell: ({ row }) => getParentName(row.original.parentId),
      },
      {
        id: 'kid',
        accessorFn: row => getKidName(row.kidId),
        header: 'Kid Name',
        cell: ({ row }) => getKidName(row.original.kidId),
      },
      {
        id: 'coach',
        header: 'Coach',
        cell: ({ row }) => {
          const request = row.original;
          const coachId = getCoachIdFromRow(request.coachId);
          if (request.status === 'PENDING') {
            return (
              <Select
                value={coachId || undefined}
                onValueChange={val => assignCoachMutation.mutate({ id: request.id, coachId: val })}
                disabled={assignCoachMutation.isPending || coaches.length === 0}
              >
                <SelectTrigger className="h-9 w-[220px]">
                  <SelectValue
                    placeholder={coaches.length === 0 ? 'Loading coaches...' : 'Assign coach…'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.coachProfile?.name || c.email || 'Coach'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }
          return <span className="text-sm">{getCoachDisplayName(request.coachId)}</span>;
        },
      },
      {
        accessorKey: 'preferredDateTime',
        header: 'Preferred Date & Time',
        cell: ({ row }) => formatDateTime(row.original.preferredDateTime),
      },
      {
        accessorKey: 'sessionType',
        header: 'Session Type',
        cell: ({ row }) => formatSessionType(row.original.sessionType),
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
                    onClick={() => openApproveDialog(request)}
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
    ],
    [
      coaches,
      openApproveDialog,
      assignCoachMutation.mutate,
      assignCoachMutation.isPending,
      approveMutation.isPending,
      denyMutation.mutate,
      denyMutation.isPending,
    ]
  );

  return (
    <div className="space-y-4">
      <Dialog
        open={approveTarget !== null}
        onOpenChange={open => {
          if (!open) closeApproveDialog();
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-md">
          <DialogHeader className="px-6 pt-6 text-left">
            <DialogTitle>Approve extra session</DialogTitle>
            <DialogDescription>
              Select the coach for this session. This is saved when you approve.
            </DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="flex flex-col space-y-4 px-6 pb-6 pt-1">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Child: </span>
                  {getKidName(approveTarget.kidId)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Parent: </span>
                  {getParentName(approveTarget.parentId)}
                </p>
                <p>
                  <span className="font-medium text-foreground">When: </span>
                  {formatDateTime(approveTarget.preferredDateTime)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="approve-extra-coach">
                  Coach
                </label>
                <Select
                  value={approveCoachId || undefined}
                  onValueChange={setApproveCoachId}
                  disabled={coaches.length === 0}
                >
                  <SelectTrigger id="approve-extra-coach" className="w-full">
                    <SelectValue
                      placeholder={coaches.length === 0 ? 'Loading coaches…' : 'Select a coach'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.coachProfile?.name || c.email || 'Coach'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="mt-auto gap-2 border-t bg-muted/30 px-6 py-5 sm:gap-2">
            <Button type="button" variant="outline" onClick={closeApproveDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!approveCoachId || approveMutation.isPending}
              onClick={() => {
                if (approveTarget && approveCoachId) {
                  approveMutation.mutate({
                    id: approveTarget.id,
                    coachId: approveCoachId,
                  });
                }
              }}
            >
              {approveMutation.isPending ? 'Approving…' : 'Approve session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <ErrorState
          title="Failed to load extra session requests"
          onRetry={() => window.location.reload()}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No extra session requests found"
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
