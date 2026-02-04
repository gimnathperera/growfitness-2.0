import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { usersService } from '@/services/users.service';
import { User } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateParentDialog } from './CreateParentDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserDetailsDialog } from './UserDetailsDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserStatus } from '@grow-fitness/shared-types';

export function ParentsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('userId');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Sync selectedUser with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch user if we have ID in URL but no selectedUser
      if (!selectedUser || selectedUser.id !== entityId) {
        usersService
          .getParentById(entityId)
          .then(response => {
            setSelectedUser(response);
          })
          .catch(() => {
            // User not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedUser(null);
    }
  }, [entityId, modal, selectedUser, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const { data, isLoading, error } = useApiQuery(
    [
      'users',
      'parents',
      page.toString(),
      pageSize.toString(),
      search,
      locationFilter,
      statusFilter,
    ],
    () =>
      usersService.getParents(
        page,
        pageSize,
        search || undefined,
        locationFilter || undefined,
        statusFilter === 'ALL' ? undefined : statusFilter
      )
  );

  const deleteMutation = useApiMutation((id: string) => usersService.deleteParent(id), {
    invalidateQueries: [['users', 'parents']],
    onSuccess: () => {
      toast.success('Parent deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete parent', error.message);
    },
  });

  const handleDelete = async (user: User) => {
    const confirmed = await confirm({
      title: 'Delete Parent',
      description: `Are you sure you want to delete ${user.parentProfile?.name || user.email}? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(user.id);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'parentProfile.name',
      header: 'Name',
      cell: ({ row }) => row.original.parentProfile?.name || 'N/A',
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
      accessorKey: 'parentProfile.location',
      header: 'Location',
      cell: ({ row }) => row.original.parentProfile?.location || 'N/A',
    },
    {
      id: 'sessionTypes',
      header: 'Session Type',
      cell: ({ row }) => {
        const types = row.original.sessionTypes || [];
        return (
          <div className="flex gap-1 flex-wrap">
            {types.length > 0 ? (
              types.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
          </div>
        );
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
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(user);
                openModal(user.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(user);
                openModal(user.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <SearchInput
            placeholder="Search parents..."
            onSearch={setSearch}
            className="w-[250px]"
          />
          <SearchInput
            placeholder="Filter location..."
            onSearch={setLocationFilter}
            className="w-[200px]"
          />
          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as UserStatus | 'ALL')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        </div>
      </div>

      {error ? (
        <div>Error loading parents</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No parents found"
          />
          {data && <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />}
        </>
      )}

      <CreateParentDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedUser || entityId) && (
        <>
          <EditUserDialog
            open={editDialogOpen}
            onOpenChange={closeModal}
            user={selectedUser || undefined}
            userType="parent"
          />
          <UserDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={closeModal}
            user={selectedUser || undefined}
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
