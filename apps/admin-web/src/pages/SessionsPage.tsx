import { useState, useEffect, useMemo } from 'react';
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
import { Plus, Pencil, Trash2, Eye, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { CreateSessionDialog } from '@/components/sessions/CreateSessionDialog';
import { EditSessionDialog } from '@/components/sessions/EditSessionDialog';
import { SessionDetailsDialog } from '@/components/sessions/SessionDetailsDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { SessionsCalendar } from '@/components/sessions/SessionsCalendar';

export function SessionsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [coachFilter, setCoachFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('sessionId');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('view') || 'list';

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  // Sync selectedSession with URL params
  useEffect(() => {
    if (entityId && modal) {
      if (!selectedSession || selectedSession.id !== entityId) {
        sessionsService
          .getSessionById(entityId)
          .then(response => {
            setSelectedSession(response);
          })
          .catch(() => {
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedSession(null);
    }
  }, [entityId, modal, selectedSession, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );

  const { data, isLoading, error } = useApiQuery(
    ['sessions', page.toString(), pageSize.toString(), coachFilter, locationFilter, statusFilter],
    () =>
      sessionsService.getSessions(page, pageSize, {
        coachId: coachFilter || undefined,
        locationId: locationFilter || undefined,
        status: statusFilter || undefined,
      }),
    {
      enabled: currentTab === 'list'
    }
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
      deleteMutation.mutate(session.id);
    }
  };

  const getCoachName = (coachId: any): string => {
    if (!coachId) return 'N/A';
    if (typeof coachId === 'string') {
      const coach = coachesData?.data?.find(c => c.id === coachId);
      return coach?.coachProfile?.name || coach?.email || 'N/A';
    }
    if (typeof coachId === 'object') {
      if (coachId.coachProfile?.name) return coachId.coachProfile.name;
      if (coachId.email) return coachId.email;
    }
    return 'N/A';
  };

  const columns = useMemo<ColumnDef<Session>[]>(() => [
    {
      accessorKey: 'dateTime',
      header: 'Date & Time',
      cell: ({ row }) => formatDateTime(row.original.dateTime),
    },
    {
      accessorKey: 'coachId',
      header: 'Coach',
      cell: ({ row }) => getCoachName(row.original.coachId),
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
                openModal(session.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedSession(session);
                openModal(session.id, 'edit');
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
  ], [coachesData]);

  const filters = (
    <FilterBar>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Coach:</label>
        <Select
          value={coachFilter || 'all'}
          onValueChange={value => setCoachFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All coaches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All coaches</SelectItem>
            {(coachesData?.data || []).map(coach => (
              <SelectItem key={coach.id} value={coach.id}>
                {coach.coachProfile?.name || coach.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Location:</label>
        <Select
          value={locationFilter || 'all'}
          onValueChange={value => setLocationFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {(locationsData?.data || []).map(location => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Status:</label>
        <Select
          value={statusFilter || 'all'}
          onValueChange={value =>
            setStatusFilter(value === 'all' ? '' : (value as SessionStatus))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={SessionStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={SessionStatus.CONFIRMED}>Confirmed</SelectItem>
            <SelectItem value={SessionStatus.CANCELLED}>Cancelled</SelectItem>
            <SelectItem value={SessionStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage training sessions</p>
        </div>
        <Button onClick={() => openModal(null, 'create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </div>

        {filters}

        <TabsContent value="list" className="space-y-4">
          {error ? (
            <ErrorState title="Failed to load sessions" onRetry={() => window.location.reload()} />
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
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <SessionsCalendar
            coachId={coachFilter}
            locationId={locationFilter}
            status={statusFilter}
            onSessionClick={(session) => {
              setSelectedSession(session);
              openModal(session.id, 'details');
            }}
          />
        </TabsContent>
      </Tabs>

      <CreateSessionDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedSession || entityId) && (
        <>
          <EditSessionDialog
            open={editDialogOpen}
            onOpenChange={closeModal}
            session={selectedSession || undefined}
          />
          <SessionDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={closeModal}
            session={selectedSession || undefined}
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
