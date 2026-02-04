import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { locationsService } from '@/services/locations.service';
import { Location } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { CreateLocationDialog } from '@/components/locations/CreateLocationDialog';
import { EditLocationDialog } from '@/components/locations/EditLocationDialog';
import { LocationDetailsDialog } from '@/components/locations/LocationDetailsDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';

export function LocationsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('locationId');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Sync selectedLocation with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch location if we have ID in URL but no selectedLocation
      if (!selectedLocation || selectedLocation.id !== entityId) {
        locationsService
          .getLocationById(entityId)
          .then(response => {
            setSelectedLocation(response);
          })
          .catch(() => {
            // Location not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedLocation(null);
    }
  }, [entityId, modal, selectedLocation, closeModal]);

  const detailsDialogOpen = modal === 'details' && isOpen;
  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const { data, isLoading, error } = useApiQuery(
    ['locations', page.toString(), pageSize.toString()],
    () => locationsService.getLocations(page, pageSize)
  );

  const deleteMutation = useApiMutation((id: string) => locationsService.deleteLocation(id), {
    invalidateQueries: [['locations']],
    onSuccess: () => {
      toast.success('Location deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete location', error.message);
    },
  });

  const handleDelete = async (location: Location) => {
    const confirmed = await confirm({
      title: 'Delete Location',
      description: `Are you sure you want to delete ${location.name}? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(location.id);
    }
  };

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
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
        const location = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedLocation(location);
                openModal(location.id, 'details');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedLocation(location);
                openModal(location.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(location)}>
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
        <h1 className="text-3xl font-bold">Locations</h1>
        <p className="text-muted-foreground mt-1">Manage training locations</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {error ? (
          <div>Error loading locations</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No locations found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateLocationDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedLocation || entityId) && (
        <>
          <EditLocationDialog
            open={editDialogOpen}
            onOpenChange={closeModal}
            location={selectedLocation || undefined}
          />
          <LocationDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={closeModal}
            location={selectedLocation || undefined}
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
