import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { bannersService } from '@/services/banners.service';
import { Banner, BannerTargetAudience } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatBannerTargetAudience } from '@/lib/formatters';
import { CreateBannerDialog } from '@/components/banners/CreateBannerDialog';
import { EditBannerDialog } from '@/components/banners/EditBannerDialog';
import { BannerPreviewDialog } from '@/components/banners/BannerPreviewDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';

export function BannersPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

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
      deleteMutation.mutate(banner._id);
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
              toggleActiveMutation.mutate({ id: banner._id, active: checked })
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
              onClick={() => {
                setSelectedBanner(banner);
                setPreviewDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedBanner(banner);
                setEditDialogOpen(true);
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
        <div className="flex items-center justify-between">
          <Button onClick={() => setCreateDialogOpen(true)}>
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

      <CreateBannerDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedBanner && (
        <>
          <EditBannerDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            banner={selectedBanner}
          />
          <BannerPreviewDialog
            open={previewDialogOpen}
            onOpenChange={setPreviewDialogOpen}
            banner={selectedBanner}
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
