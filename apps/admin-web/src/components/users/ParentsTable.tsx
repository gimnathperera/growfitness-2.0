import { useState } from 'react';
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

export function ParentsTable() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  const { data, isLoading, error } = useApiQuery(
    ['users', 'parents', page.toString(), pageSize.toString(), search],
    () => usersService.getParents(page, pageSize, search || undefined)
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
      deleteMutation.mutate(user._id);
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
                setDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(user);
                setEditDialogOpen(true);
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
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search parents..." onSearch={setSearch} className="max-w-sm" />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
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

      <CreateParentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedUser && (
        <>
          <EditUserDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={selectedUser}
            userType="parent"
          />
          <UserDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            user={selectedUser}
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
