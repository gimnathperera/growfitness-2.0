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

type ProfileRef = {
  email?: string;
  parentProfile?: { name?: string };
  coachProfile?: { name?: string };
};

type RescheduleKidRef = {
  name?: string;
  parentId?: string | ProfileRef;
};

type RescheduleSessionRef = {
  id?: string;
  _id?: string;
  dateTime?: Date | string;
  coachId?: string | ProfileRef;
  locationId?: string | { name?: string; address?: string };
  kids?: (string | RescheduleKidRef)[];
};

type RescheduleRequestRow = Omit<RescheduleRequest, 'sessionId' | 'requestedBy'> & {
  sessionId?: string | RescheduleSessionRef;
  requestedBy?: string | ProfileRef;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getProfileName = (
  value: unknown,
  profileKey: 'parentProfile' | 'coachProfile'
): string | undefined => {
  if (!isRecord(value)) return undefined;
  const profile = value[profileKey];
  if (isRecord(profile) && typeof profile.name === 'string' && profile.name.trim()) {
    return profile.name;
  }
  return typeof value.email === 'string' && value.email.trim() ? value.email : undefined;
};

const getSession = (request: RescheduleRequestRow): RescheduleSessionRef | undefined =>
  isRecord(request.sessionId) ? (request.sessionId as RescheduleSessionRef) : undefined;

const getParentName = (request: RescheduleRequestRow): string => {
  const session = getSession(request);
  const kids = Array.isArray(session?.kids) ? session.kids : [];
  const parentName = kids
    .map(kid => (isRecord(kid) ? getProfileName(kid.parentId, 'parentProfile') : undefined))
    .find(Boolean);

  return parentName || getProfileName(request.requestedBy, 'parentProfile') || 'N/A';
};

const getKidsName = (request: RescheduleRequestRow): string => {
  const session = getSession(request);
  const names = (Array.isArray(session?.kids) ? session.kids : [])
    .map(kid => (isRecord(kid) && typeof kid.name === 'string' ? kid.name : undefined))
    .filter((name): name is string => Boolean(name?.trim()));

  return names.length > 0 ? names.join(', ') : 'N/A';
};

const getCoachName = (request: RescheduleRequestRow): string =>
  getProfileName(getSession(request)?.coachId, 'coachProfile') || 'N/A';

const getLocationName = (request: RescheduleRequestRow): string => {
  const location = getSession(request)?.locationId;
  if (isRecord(location) && typeof location.name === 'string' && location.name.trim()) {
    return location.name;
  }
  return 'N/A';
};

const getCurrentDateTime = (request: RescheduleRequestRow): string =>
  formatDateTime(getSession(request)?.dateTime);

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

  const columns: ColumnDef<RescheduleRequestRow>[] = [
    {
      id: 'parent',
      header: 'Parent Name',
      enableSorting: false,
      cell: ({ row }) => getParentName(row.original),
    },
    {
      id: 'kid',
      header: 'Kid Name(s)',
      enableSorting: false,
      cell: ({ row }) => getKidsName(row.original),
    },
    {
      id: 'coach',
      header: 'Coach',
      enableSorting: false,
      cell: ({ row }) => getCoachName(row.original),
    },
    {
      id: 'location',
      header: 'Location',
      enableSorting: false,
      cell: ({ row }) => getLocationName(row.original),
    },
    {
      id: 'sessionId',
      header: 'Current Date & Time',
      enableSorting: false,
      cell: ({ row }) => getCurrentDateTime(row.original),
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
            data={(data?.data || []) as RescheduleRequestRow[]}
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
