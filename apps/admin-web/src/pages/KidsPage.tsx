import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { usersService } from '@/services/users.service';
import { Kid, SessionType } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterBar } from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Eye, Link2, Unlink } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { formatSessionType } from '@/lib/formatters';
import { CreateKidDialog } from '@/components/kids/CreateKidDialog';
import { EditKidDialog } from '@/components/kids/EditKidDialog';
import { KidDetailsDialog } from '@/components/kids/KidDetailsDialog';
import { LinkParentDialog } from '@/components/kids/LinkParentDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';

export function KidsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [, setSearch] = useState('');
  const [parentIdFilter, setParentIdFilter] = useState<string>('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<SessionType | ''>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  const { data: parentsData } = useApiQuery(['users', 'parents', 'all'], () =>
    usersService.getParents(1, 1000)
  );

  const { data, isLoading, error } = useApiQuery(
    ['kids', page.toString(), pageSize.toString(), parentIdFilter, sessionTypeFilter],
    () =>
      kidsService.getKids(
        page,
        pageSize,
        parentIdFilter || undefined,
        sessionTypeFilter || undefined
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
      deleteMutation.mutate(kid._id);
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
      header: 'Birth Date',
      cell: ({ row }) => formatDate(row.original.birthDate),
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
      cell: ({ row }) => formatSessionType(row.original.sessionType),
    },
    {
      accessorKey: 'goal',
      header: 'Goal',
      cell: ({ row }) => row.original.goal || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const kid = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedKid(kid);
                setDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedKid(kid);
                setEditDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedKid(kid);
                setLinkDialogOpen(true);
              }}
            >
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
        <div className="flex items-center justify-between">
          <SearchInput placeholder="Search kids..." onSearch={setSearch} className="max-w-sm" />
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Kid
          </Button>
        </div>

        <FilterBar>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Parent:</label>
            <Select value={parentIdFilter} onValueChange={setParentIdFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All parents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All parents</SelectItem>
                {parentsData?.data.map(parent => (
                  <SelectItem key={parent._id} value={parent._id}>
                    {parent.parentProfile?.name || parent.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Session Type:</label>
            <Select
              value={sessionTypeFilter}
              onValueChange={value => setSessionTypeFilter(value as SessionType | '')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value={SessionType.INDIVIDUAL}>Individual</SelectItem>
                <SelectItem value={SessionType.GROUP}>Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {error ? (
          <div>Error loading kids</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No kids found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateKidDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedKid && (
        <>
          <EditKidDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} kid={selectedKid} />
          <KidDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            kid={selectedKid}
          />
          <LinkParentDialog
            open={linkDialogOpen}
            onOpenChange={setLinkDialogOpen}
            kid={selectedKid}
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
