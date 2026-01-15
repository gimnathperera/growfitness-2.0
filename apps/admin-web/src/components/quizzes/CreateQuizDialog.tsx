import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';
import { CreateQuizSchema, CreateQuizDto } from '@grow-fitness/shared-schemas';
import { BannerTargetAudience, QuestionType } from '@grow-fitness/shared-types';
import { useApiMutation } from '@/hooks/useApiMutation';
import { quizzesService } from '@/services/quizzes.service';
import { useToast } from '@/hooks/useToast';
import { useModalParams } from '@/hooks/useModalParams';
import { QuestionEditor } from './QuestionEditor';
import { Plus } from 'lucide-react';

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuizDialog({ open, onOpenChange }: CreateQuizDialogProps) {
  const { closeModal } = useModalParams('quizId');
  const { toast } = useToast();

  // Handle close with URL params
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  const defaultValues: CreateQuizDto = {
    title: '',
    description: '',
    questions: [
      {
        question: '',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['Option 1', 'Option 2'],
        correctAnswer: 'Option 1',
        points: 10,
      },
    ],
    targetAudience: BannerTargetAudience.ALL,
    passingScore: 70,
  };

  const form = useForm<CreateQuizDto>({
    resolver: zodResolver(CreateQuizSchema),
    defaultValues,
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open]);

  const createMutation = useApiMutation((data: CreateQuizDto) => quizzesService.createQuiz(data), {
    invalidateQueries: [['quizzes']],
    onSuccess: () => {
      toast.success('Quiz created successfully');
      form.reset(defaultValues);
      setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    },
    onError: error => {
      toast.error('Failed to create quiz', error.message || 'An error occurred');
    },
  });

  const onSubmit = (data: CreateQuizDto) => {
    createMutation.mutate(data);
  };

  const addQuestion = () => {
    appendQuestion({
      question: '',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['Option 1', 'Option 2'],
      correctAnswer: 'Option 1',
      points: 10,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b bg-muted/30 flex-shrink-0">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Create Quiz</DialogTitle>
              <DialogDescription className="text-sm">
                Create a new quiz with multiple questions
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="create-quiz-form"
              className="space-y-6"
            >
              <FormField label="Title" required error={form.formState.errors.title?.message}>
                <Input {...form.register('title')} placeholder="Enter quiz title" />
              </FormField>

              <FormField label="Description" error={form.formState.errors.description?.message}>
                <Textarea
                  {...form.register('description')}
                  placeholder="Enter quiz description (optional)"
                  rows={3}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Target Audience"
                  required
                  error={form.formState.errors.targetAudience?.message}
                >
                  <Select
                    value={form.watch('targetAudience')}
                    onValueChange={value =>
                      form.setValue('targetAudience', value as BannerTargetAudience)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BannerTargetAudience.ALL}>All</SelectItem>
                      <SelectItem value={BannerTargetAudience.PARENT}>Parent</SelectItem>
                      <SelectItem value={BannerTargetAudience.COACH}>Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Passing Score (%)"
                  error={form.formState.errors.passingScore?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('passingScore', { valueAsNumber: true })}
                    placeholder="70"
                  />
                </FormField>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Questions</label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                {form.formState.errors.questions && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.questions.message || 'Please fix question errors'}
                  </p>
                )}

                {questionFields.map((field, index) => (
                  <QuestionEditor
                    key={field.id}
                    form={form as any}
                    questionIndex={index}
                    onRemove={() => {
                      if (questionFields.length > 1) {
                        removeQuestion(index);
                      }
                    }}
                    canRemove={questionFields.length > 1}
                  />
                ))}
              </div>
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-quiz-form" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Quiz'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
