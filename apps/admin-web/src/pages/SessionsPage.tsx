import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
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
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateSessionDialog } from '@/components/sessions/CreateSessionDialog';
import { EditSessionDialog } from '@/components/sessions/EditSessionDialog';
import { SessionDetailsDialog } from '@/components/sessions/SessionDetailsDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';

export function SessionsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [coachFilter, setCoachFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 1000)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 1000)
  );

  const { data, isLoading, error } = useApiQuery(
    ['sessions', page, pageSize, coachFilter, locationFilter, statusFilter],
    () =>
      sessionsService.getSessions(page, pageSize, {
        coachId: coachFilter || undefined,
        locationId: locationFilter || undefined,
        status: statusFilter || undefined,
      })
  );

  const deleteMutation = useApiMutation((id: string) => sessionsService.deleteSession(id), {
    invalidateQueries: [['sessions']],
    onSuccess: () => {
      toast.success('Session deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete session', error.message);
    },
  });

  const handleDelete = async (session: Session) => {
    const confirmed = await confirm({
      title: 'Delete Session',
      description: 'Are you sure you want to delete this session? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(session._id);
    }
  };

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: 'dateTime',
      header: 'Date & Time',
      cell: ({ row }) => formatDateTime(row.original.dateTime),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => formatSessionType(row.original.type),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => `${row.original.duration} min`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'isFreeSession',
      header: 'Free Session',
      cell: ({ row }) => (row.original.isFreeSession ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedSession(session);
                setDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedSession(session);
                setEditDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(session)}>
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
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-1">Manage training sessions</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>

        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Coach:</label>
            <Select value={coachFilter} onValueChange={setCoachFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All coaches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All coaches</SelectItem>
                {coachesData?.data.map(coach => (
                  <SelectItem key={coach._id} value={coach._id}>
                    {coach.coachProfile?.name || coach.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Location:</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {locationsData?.data.map(location => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as SessionStatus | '')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value={SessionStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={SessionStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={SessionStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={SessionStatus.COMPLETED}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {error ? (
          <div>Error loading sessions</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No sessions found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateSessionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedSession && (
        <>
          <EditSessionDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            session={selectedSession}
          />
          <SessionDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            session={selectedSession}
          />
        </>
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
