import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { kidsService } from '@/services/kids.service';
import { Kid } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
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
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';
import { useSearchParams } from 'react-router-dom';

export function KidsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [search, setSearch] = useState('');
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('kidId');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Handle link dialog separately (it uses a different param)
  const linkDialogOpen = searchParams.get('linkKid') === entityId;

  // Reset to page 1 when search changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

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
    ['kids', page.toString(), pageSize.toString(), search],
    () => kidsService.getKids(page, pageSize, undefined, undefined, search || undefined)
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenLinkDialog(kid)}
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
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateKidDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedKid || entityId) && (
        <>
          <EditKidDialog open={editDialogOpen} onOpenChange={closeModal} kid={selectedKid || undefined} />
          <KidDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={closeModal}
            kid={selectedKid || undefined}
          />
          {selectedKid && (
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
