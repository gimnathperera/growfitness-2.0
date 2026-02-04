import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { bannersService } from '@/services/banners.service';
import { Banner } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatBannerTargetAudience } from '@/lib/formatters';
import { CreateBannerDialog } from '@/components/banners/CreateBannerDialog';
import { EditBannerDialog } from '@/components/banners/EditBannerDialog';
import { BannerPreviewDialog } from '@/components/banners/BannerPreviewDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';
import { useSearchParams } from 'react-router-dom';

export function BannersPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('bannerId');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Handle preview dialog separately (it uses a different param)
  const previewDialogOpen = searchParams.get('previewBanner') === entityId;

  // Sync selectedBanner with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch banner if we have ID in URL but no selectedBanner
      if (!selectedBanner || selectedBanner.id !== entityId) {
        bannersService
          .getBannerById(entityId)
          .then(response => {
            setSelectedBanner(response);
          })
          .catch(() => {
            // Banner not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedBanner(null);
    }
  }, [entityId, modal, selectedBanner, closeModal]);

  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const handleOpenPreviewDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('bannerId', banner.id);
      newParams.set('previewBanner', banner.id);
      return newParams;
    });
  };

  const handleClosePreviewDialog = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('previewBanner');
      return newParams;
    });
  };

  const { data, isLoading, error } = useApiQuery(
    ['banners', page.toString(), pageSize.toString()],
    () => bannersService.getBanners(page, pageSize)
  );

  const deleteMutation = useApiMutation((id: string) => bannersService.deleteBanner(id), {
    invalidateQueries: [['banners']],
    onSuccess: () => {
      toast.success('Banner deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete banner', error.message);
    },
  });

  const toggleActiveMutation = useApiMutation(
    ({ id, active }: { id: string; active: boolean }) =>
      bannersService.updateBanner(id, { active }),
    {
      invalidateQueries: [['banners']],
      onSuccess: () => {
        toast.success('Banner updated successfully');
      },
    }
  );

  const handleDelete = async (banner: Banner) => {
    const confirmed = await confirm({
      title: 'Delete Banner',
      description: `Are you sure you want to delete this banner? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(banner.id);
    }
  };

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: 'imageUrl',
      header: 'Preview',
      cell: ({ row }) => (
        <img src={row.original.imageUrl} alt="Banner" className="h-12 w-32 object-cover rounded" />
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order',
    },
    {
      accessorKey: 'targetAudience',
      header: 'Target Audience',
      cell: ({ row }) => formatBannerTargetAudience(row.original.targetAudience),
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <Switch
            checked={banner.active}
            onCheckedChange={checked =>
              toggleActiveMutation.mutate({ id: banner.id, active: checked })
            }
          />
        );
      },
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
        const banner = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenPreviewDialog(banner)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedBanner(banner);
                openModal(banner.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(banner)}>
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
        <h1 className="text-3xl font-bold">Banners</h1>
        <p className="text-muted-foreground mt-1">Manage promotional banners</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {error ? (
          <div>Error loading banners</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No banners found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateBannerDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedBanner || entityId) && (
        <>
          <EditBannerDialog
            open={editDialogOpen}
            onOpenChange={closeModal}
            banner={selectedBanner || undefined}
          />
          {selectedBanner && (
            <BannerPreviewDialog
              open={previewDialogOpen}
              onOpenChange={handleClosePreviewDialog}
              banner={selectedBanner}
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
