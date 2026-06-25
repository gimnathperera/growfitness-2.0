import { useState, useEffect, useMemo } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { SessionSortField, SortOrder, sessionsService } from '@/services/sessions.service';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { ClearFiltersButton } from '@/components/common/ClearFiltersButton';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  LayoutList,
  Calendar as CalendarIcon,
  CalendarClock,
  Repeat,
} from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ErrorState } from '@/components/common/ErrorState';
import { CreateSessionDialog } from '@/components/sessions/CreateSessionDialog';
import { EditSessionDialog } from '@/components/sessions/EditSessionDialog';
import { SessionDetailsDialog } from '@/components/sessions/SessionDetailsDialog';
import {
  RescheduleSessionDialog,
  canAdminRescheduleSession,
} from '@/components/sessions/RescheduleSessionDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { SessionsCalendar } from '@/components/sessions/SessionsCalendar';
import { SessionSpecialBadges } from '@/components/sessions/SessionSpecialBadges';
import { googleCalendarService } from '@/services/google-calendar.service';

export function SessionsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [coachFilter, setCoachFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortBy = sorting[0]?.id as SessionSortField | undefined;
  const sortOrder = sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined;

  const hasActiveFilters = Boolean(search || coachFilter || locationFilter || statusFilter);

  const clearAllFilters = () => {
    setSearch('');
    setCoachFilter('');
    setLocationFilter('');
    setStatusFilter('');
    setSearchInputKey(key => key + 1);
  };
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('sessionId');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('view') || 'list';

  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarBusy, setCalendarBusy] = useState(false);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search, coachFilter, locationFilter, statusFilter, sorting]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (currentTab !== 'calendar') return;

    let active = true;
    const load = async () => {
      setCalendarLoading(true);
      try {
        const status = await googleCalendarService.getStatus();
        if (active) setCalendarConnected(status.connected);
      } catch {
        if (active) setCalendarConnected(false);
      } finally {
        if (active) setCalendarLoading(false);
      }
    };

    void load();

    const url = new URL(window.location.href);
    if (url.searchParams.has('connected') || url.searchParams.has('error')) {
      url.searchParams.delete('connected');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }

    return () => {
      active = false;
    };
  }, [currentTab]);

  const handleSyncWithGoogleCalendar = async () => {
    setCalendarBusy(true);
    try {
      const redirectUri = new URL(window.location.href);
      redirectUri.searchParams.delete('connected');
      redirectUri.searchParams.delete('error');
      const { url } = await googleCalendarService.getAuthUrl(redirectUri.toString());
      window.location.href = url;
    } finally {
      setCalendarBusy(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    setCalendarBusy(true);
    try {
      await googleCalendarService.disconnect();
      const status = await googleCalendarService.getStatus();
      setCalendarConnected(status.connected);
    } finally {
      setCalendarBusy(false);
    }
  };

  const detailsDialogOpen = modal === 'details' && isOpen;
  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;
  const rescheduleDialogOpen = modal === 'reschedule' && isOpen;

  const { data: coachesData } = useApiQuery(['users', 'coaches', 'all'], () =>
    usersService.getCoaches(1, 100)
  );

  const { data: locationsData } = useApiQuery(['locations', 'all'], () =>
    locationsService.getLocations(1, 100)
  );

  const { data, isLoading, error } = useApiQuery(
    [
      'sessions',
      page.toString(),
      pageSize.toString(),
      search,
      coachFilter,
      locationFilter,
      statusFilter,
      sortBy || '',
      sortOrder || '',
    ],
    () =>
      sessionsService.getSessions(page, pageSize, {
        search: search || undefined,
        coachId: coachFilter || undefined,
        locationId: locationFilter || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder: sortOrder as SortOrder | undefined,
      }),
    {
      enabled: currentTab === 'list',
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

  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <span>{row.original.title || 'N/A'}</span>
            <SessionSpecialBadges session={row.original} />
            {row.original.recurringGroupId ? (
              <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                <Repeat className="h-3 w-3" />
                Recurring
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'dateTime',
        header: 'Date & Time',
        cell: ({ row }) => formatDateTime(row.original.dateTime),
      },
      {
        accessorKey: 'coachId',
        header: 'Coach',
        enableSorting: false,
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
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
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
                disabled={!canAdminRescheduleSession(session)}
                title={
                  canAdminRescheduleSession(session)
                    ? 'Reschedule session'
                    : 'Cannot reschedule cancelled or completed sessions'
                }
                onClick={() => {
                  setSelectedSession(session);
                  openModal(session.id, 'reschedule');
                }}
              >
                <CalendarClock className="h-4 w-4" />
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
    ],
    [coachesData]
  );

  const filters = (
    <FilterBar>
      <SearchInput
        key={`session-search-${searchInputKey}`}
        placeholder="Search sessions..."
        onSearch={setSearch}
        className="w-[280px]"
      />
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
          onValueChange={value => setStatusFilter(value === 'all' ? '' : (value as SessionStatus))}
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

      <ClearFiltersButton onClear={clearAllFilters} disabled={!hasActiveFilters} />
    </FilterBar>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage training sessions</p>
        </div>
        <Button onClick={() => openModal(null, 'create')} className="w-full sm:w-auto">
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
                manualSorting
                sorting={sorting}
                onSortingChange={setSorting}
              />
              {data && (
                <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={calendarConnected ? 'outline' : 'default'}
              onClick={
                calendarConnected ? handleDisconnectGoogleCalendar : handleSyncWithGoogleCalendar
              }
              disabled={calendarLoading || calendarBusy}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              {calendarConnected ? 'Disconnect Google Calendar' : 'Sync with Google Calendar'}
            </Button>
          </div>
          <SessionsCalendar
            coachId={coachFilter}
            locationId={locationFilter}
            status={statusFilter}
            onSessionClick={session => {
              setSelectedSession(session);
              openModal(session.id, 'edit');
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
            onReschedule={session => {
              setSelectedSession(session);
              openModal(session.id, 'reschedule');
            }}
            onEdit={session => {
              setSelectedSession(session);
              openModal(session.id, 'edit');
            }}
          />
          <RescheduleSessionDialog
            open={rescheduleDialogOpen}
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
