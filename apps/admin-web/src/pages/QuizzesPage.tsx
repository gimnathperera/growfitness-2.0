import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks';
import { quizzesService } from '@/services/quizzes.service';
import { Quiz, BannerTargetAudience } from '@grow-fitness/shared-types';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatBannerTargetAudience } from '@/lib/formatters';
import { CreateQuizDialog } from '@/components/quizzes/CreateQuizDialog';
import { EditQuizDialog } from '@/components/quizzes/EditQuizDialog';
import { QuizDetailsDialog } from '@/components/quizzes/QuizDetailsDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { useModalParams } from '@/hooks/useModalParams';
import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function QuizzesPage() {
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('quizId');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [targetAudienceFilter, setTargetAudienceFilter] = useState<string>('all');
  const { toast } = useToast();
  const { confirm, confirmState } = useConfirm();

  // Handle details dialog separately (it uses a different param)
  const detailsDialogOpen = searchParams.get('detailsQuiz') === entityId;

  // Sync selectedQuiz with URL params
  useEffect(() => {
    if (entityId && modal) {
      // Fetch quiz if we have ID in URL but no selectedQuiz
      if (!selectedQuiz || selectedQuiz.id !== entityId) {
        quizzesService
          .getQuizById(entityId)
          .then(response => {
            setSelectedQuiz(response);
          })
          .catch(() => {
            // Quiz not found, close modal
            closeModal();
          });
      }
    } else if (!entityId && !modal) {
      setSelectedQuiz(null);
    }
  }, [entityId, modal, selectedQuiz, closeModal]);

  const editDialogOpen = modal === 'edit' && isOpen;
  const createDialogOpen = modal === 'create' && isOpen;

  const handleOpenDetailsDialog = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('quizId', quiz.id);
      newParams.set('detailsQuiz', quiz.id);
      return newParams;
    });
  };

  const handleCloseDetailsDialog = (open: boolean) => {
    if (!open) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('detailsQuiz');
        newParams.delete('quizId');
        return newParams;
      });
      setSelectedQuiz(null);
    }
  };

  const { data, isLoading, error } = useApiQuery(
    ['quizzes', page.toString(), pageSize.toString(), targetAudienceFilter],
    () =>
      quizzesService.getQuizzes(
        page,
        pageSize,
        targetAudienceFilter === 'all' ? undefined : targetAudienceFilter
      )
  );

  const deleteMutation = useApiMutation((id: string) => quizzesService.deleteQuiz(id), {
    invalidateQueries: [['quizzes']],
    onSuccess: () => {
      toast.success('Quiz deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete quiz', error.message);
    },
  });

  const toggleActiveMutation = useApiMutation(
    ({ id, active }: { id: string; active: boolean }) =>
      quizzesService.updateQuiz(id, { isActive: active }),
    {
      invalidateQueries: [['quizzes']],
      onSuccess: () => {
        toast.success('Quiz updated successfully');
      },
    }
  );

  const handleDelete = async (quiz: Quiz) => {
    const confirmed = await confirm({
      title: 'Delete Quiz',
      description: `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete',
    });

    if (confirmed) {
      deleteMutation.mutate(quiz.id);
    }
  };

  const columns: ColumnDef<Quiz>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate max-w-md">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'targetAudience',
      header: 'Target Audience',
      cell: ({ row }) => (
        <Badge variant="secondary">{formatBannerTargetAudience(row.original.targetAudience)}</Badge>
      ),
    },
    {
      accessorKey: 'questions',
      header: 'Questions',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.questions.length} questions</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => {
        const quiz = row.original;
        return (
          <Switch
            checked={quiz.isActive}
            onCheckedChange={checked =>
              toggleActiveMutation.mutate({ id: quiz.id, active: checked })
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
        const quiz = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDetailsDialog(quiz)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedQuiz(quiz);
                openModal(quiz.id, 'edit');
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz)}>
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
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground mt-1">Manage quizzes and questions</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value={BannerTargetAudience.ALL}>All</SelectItem>
                <SelectItem value={BannerTargetAudience.PARENT}>Parent</SelectItem>
                <SelectItem value={BannerTargetAudience.COACH}>Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => openModal(null, 'create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
        </div>

        {error ? (
          <div>Error loading quizzes</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              isLoading={isLoading}
              emptyMessage="No quizzes found"
            />
            {data && (
              <Pagination data={data} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </>
        )}
      </div>

      <CreateQuizDialog open={createDialogOpen} onOpenChange={closeModal} />

      {(selectedQuiz || entityId) && (
        <>
          <EditQuizDialog
            open={editDialogOpen}
            onOpenChange={closeModal}
            quiz={selectedQuiz || undefined}
          />
          <QuizDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={handleCloseDetailsDialog}
            quiz={selectedQuiz || undefined}
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
