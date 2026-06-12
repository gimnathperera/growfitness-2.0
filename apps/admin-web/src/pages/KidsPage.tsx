import { useState, useEffect } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { KidSortField, SortOrder, kidsService } from '@/services/kids.service';
import { Kid, SessionType } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { ClearFiltersButton } from '@/components/common/ClearFiltersButton';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Eye, Link2, Unlink } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatSessionType } from '@/lib/formatters';
import { CreateKidDialog } from '@/components/kids/CreateKidDialog';
import { EditKidDialog } from '@/components/kids/EditKidDialog';
import { KidDetailsDialog } from '@/components/kids/KidDetailsDialog';
import { LinkParentDialog } from '@/components/kids/LinkParentDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';
import { useSearchParams } from 'react-router-dom';

const AGE_MIN = 0;
const AGE_MAX = 18;

export function KidsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState<[number, number]>([AGE_MIN, AGE_MAX]);
  const [sessionTypeFilter, setSessionTypeFilter] = useState<SessionType | ''>('');
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [minAge, maxAge] = ageRange;
  const sortBy = sorting[0]?.id as KidSortField | undefined;
  const sortOrder = sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined;
  const hasCustomAgeRange = minAge !== AGE_MIN || maxAge !== AGE_MAX;

  const hasActiveFilters = !!(search || gender || hasCustomAgeRange || sessionTypeFilter);

  const clearAllFilters = () => {
    setSearch('');
    setGender('');
    setAgeRange([AGE_MIN, AGE_MAX]);
    setSessionTypeFilter('');
    setSearchInputKey(key => key + 1);
  };
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('kidId');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Handle link dialog separately (it uses a different param)
  const linkDialogOpen = searchParams.get('linkKid') === entityId;

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search, gender, minAge, maxAge, sessionTypeFilter, sorting]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selectedKid with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch kid if we have ID in URL but no selectedKid
      if (!selectedKid || selectedKid.id !== entityId) {
        kidsService
          .getKidById(entityId)
          .then(response => {
            setSelectedKid(response);
          })
          .catch(() => {
            // Kid not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedKid(null);
    }
  }, [entityId, modal, selectedKid, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const handleOpenLinkDialog = (kid: Kid) => {
    setSelectedKid(kid);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('kidId', kid.id);
      newParams.set('linkKid', kid.id);
      return newParams;
    });
  };

  const handleCloseLinkDialog = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('linkKid');
      return newParams;
    });
  };

  const { data, isLoading, error } = useApiQuery(
    [
      'kids',
      page.toString(),
      pageSize.toString(),
      search,
      gender,
      minAge.toString(),
      maxAge.toString(),
      sessionTypeFilter,
      sortBy || '',
      sortOrder || '',
    ],
    () =>
      kidsService.getKids(
        page,
        pageSize,
        undefined,
        sessionTypeFilter || undefined,
        search || undefined,
        {
          gender: gender || undefined,
          minAge: hasCustomAgeRange ? minAge.toString() : undefined,
          maxAge: hasCustomAgeRange ? maxAge.toString() : undefined,
        },
        sortBy,
        sortOrder as SortOrder | undefined
      )
  );

  const deleteMutation = useApiMutation((id: string) => kidsService.unlinkFromParent(id), {
    invalidateQueries: [['kids']],
    onSuccess: () => {
      toast.success('Kid unlinked successfully');
    },
    onError: error => {
      toast.error('Failed to unlink kid', error.message);
    },
  });

  const handleUnlink = async (kid: Kid) => {
    const confirmed = await confirm({
      title: 'Unlink Kid',
      description: `Are you sure you want to unlink ${kid.name} from their parent?`,
      variant: 'destructive',
      confirmText: 'Unlink',
    });

    if (confirmed) {
      deleteMutation.mutate(kid.id);
    }
  };

  const columns: ColumnDef<Kid>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
    },
    {
      accessorKey: 'birthDate',
      header: 'Age',
      cell: ({ row }) => {
        const birthDate = new Date(row.original.birthDate);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        return age;
      },
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
      cell: ({ row }) => formatSessionType(row.original.sessionType),
    },
    {
      id: 'parentName',
      accessorFn: row => row.parent?.parentProfile?.name || '',
      header: 'Parent',
      cell: ({ row }) => row.original.parent?.parentProfile?.name || 'N/A',
    },
    {
      accessorKey: 'goal',
      header: 'Goal',
      cell: ({ row }) => row.original.goal || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const kid = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedKid(kid);
                openModal(kid.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedKid(kid);
                openModal(kid.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenLinkDialog(kid)}>
              <Link2 className="h-4 w-4" />
            </Button>
            {kid.parentId && (
              <Button variant="ghost" size="icon" onClick={() => handleUnlink(kid)}>
                <Unlink className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kids</h1>
        <p className="text-muted-foreground mt-1">Manage kids and their profiles</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              key={`kid-search-${searchInputKey}`}
              placeholder="Search kids..."
              onSearch={setSearch}
              className="max-w-sm"
            />
            {/* Gender filter */}
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <div className="flex h-9 min-w-[240px] items-center gap-3 rounded-md border border-input bg-background px-3 shadow-sm">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Age {minAge} - {maxAge}
              </span>
              <div className="relative h-5 flex-1">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
                  style={{
                    left: `${(minAge / AGE_MAX) * 100}%`,
                    right: `${100 - (maxAge / AGE_MAX) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={minAge}
                  aria-label="Minimum age"
                  onChange={e => {
                    const nextMinAge = Math.min(Number(e.target.value), maxAge);
                    setAgeRange([nextMinAge, maxAge]);
                  }}
                  className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
                />
                <input
                  type="range"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={maxAge}
                  aria-label="Maximum age"
                  onChange={e => {
                    const nextMaxAge = Math.max(Number(e.target.value), minAge);
                    setAgeRange([minAge, nextMaxAge]);
                  }}
                  className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
                />
              </div>
            </div>
            {/* Session type filter */}
            <select
              value={sessionTypeFilter}
              onChange={e => setSessionTypeFilter(e.target.value as SessionType | '')}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Session Types</option>
              <option value={SessionType.INDIVIDUAL}>Private</option>
              <option value={SessionType.GROUP}>Group</option>
              <option value={SessionType.BOTH}>Both</option>
            </select>
            <ClearFiltersButton onClear={clearAllFilters} disabled={!hasActiveFilters} />
          </div>
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Kid
          </Button>
        </div>

        {error ? (
          <ErrorState title="Failed to load kids" onRetry={() => window.location.reload()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No kids found"
              manualSorting
              sorting={sorting}
              onSortingChange={setSorting}
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateKidDialog open={createDialogOpen} onOpenChange={closeModal} />

      {selectedKid && (
        <>
          {editDialogOpen && (
            <EditKidDialog open={editDialogOpen} onOpenChange={closeModal} kid={selectedKid} />
          )}
          {detailsDialogOpen && (
            <KidDetailsDialog
              open={detailsDialogOpen}
              onOpenChange={closeModal}
              kid={selectedKid}
            />
          )}
          {linkDialogOpen && (
            <LinkParentDialog
              open={linkDialogOpen}
              onOpenChange={handleCloseLinkDialog}
              kid={selectedKid}
            />
          )}
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
