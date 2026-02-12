import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { testimonialsService } from '@/services/testimonials.service';
import { Testimonial } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { CreateTestimonialDialog } from '@/components/testimonials/CreateTestimonialDialog';
import { EditTestimonialDialog } from '@/components/testimonials/EditTestimonialDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { useModalParams } from '@/hooks/useModalParams';

export function TestimonialsPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('testimonialId');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  useEffect(() => {
    if (entityId && modal === 'edit') {
      if (!selectedTestimonial || selectedTestimonial.id !== entityId) {
        testimonialsService
          .getTestimonialById(entityId)
          .then(response => setSelectedTestimonial(response))
          .catch(() => closeModal());
      }
    } else if (!entityId && modal !== 'edit') {
      setSelectedTestimonial(null);
    }
  }, [entityId, modal, selectedTestimonial, closeModal]);

  const { data, isLoading, error, refetch } = useApiQuery(
    ['testimonials', page.toString(), pageSize.toString()],
    () => testimonialsService.getTestimonials(page, pageSize, false)
  );

  const toggleActiveMutation = useApiMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) =>
      testimonialsService.updateTestimonial(id, { isActive }),
    {
      invalidateQueries: [['testimonials']],
      onSuccess: () => {
        toast.success('Testimonial updated successfully');
      },
      onError: err => {
        toast.error('Failed to update testimonial', err.message);
      },
    }
  );

  const columns: ColumnDef<Testimonial>[] = [
    {
      accessorKey: 'authorName',
      header: 'Author',
    },
    {
      accessorKey: 'content',
      header: 'Content',
      cell: ({ row }) => {
        const content = row.original.content;
        return (
          <span className="max-w-md truncate block" title={content}>
            {content.length > 80 ? `${content.slice(0, 80)}...` : content}
          </span>
        );
      },
    },
    {
      accessorKey: 'childName',
      header: 'Child',
      cell: ({ row }) => row.original.childName || '—',
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <span>
          {row.original.rating ?? 5}/5
        </span>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order',
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => {
        const testimonial = row.original;
        return (
          <Switch
            checked={testimonial.isActive ?? true}
            onCheckedChange={checked =>
              toggleActiveMutation.mutate({ id: testimonial.id, isActive: checked })
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
        const testimonial = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedTestimonial(testimonial);
              openModal(testimonial.id, 'edit');
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="text-muted-foreground mt-1">Manage customer testimonials displayed on the website</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {error ? (
          <ErrorState title="Failed to load testimonials" onRetry={() => refetch()} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No testimonials found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateTestimonialDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedTestimonial || entityId) && (
        <EditTestimonialDialog
          open={editDialogOpen}
          onOpenChange={closeModal}
          testimonial={selectedTestimonial || undefined}
        />
      )}
    </div>
  );
}
