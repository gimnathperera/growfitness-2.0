import { useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, X } from 'lucide-react';
import { QuestionType, QuizQuestion } from '@grow-fitness/shared-types';
import { CreateQuizDto, UpdateQuizDto } from '@grow-fitness/shared-schemas';

interface QuestionEditorProps {
  form: UseFormReturn<CreateQuizDto | UpdateQuizDto>;
  questionIndex: number;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function QuestionEditor({ form, questionIndex, onRemove, canRemove = true }: QuestionEditorProps) {
  const questionType = form.watch(`questions.${questionIndex}.type`) as QuestionType | undefined;
  
  // Ensure options field exists as array for useFieldArray (required even if empty)
  const currentOptions = form.getValues(`questions.${questionIndex}.options`);
  if (!Array.isArray(currentOptions)) {
    form.setValue(`questions.${questionIndex}.options`, [], { shouldValidate: false });
  }
  
  const options = form.watch(`questions.${questionIndex}.options`) || [];

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  // When question type changes, handle options and correctAnswer
  useEffect(() => {
    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      // Ensure we have at least 2 options
      if (!options || options.length < 2) {
        const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
        if (currentOptions.length < 2) {
          const defaultOptions = ['Option 1', 'Option 2'];
          form.setValue(`questions.${questionIndex}.options`, defaultOptions);
          form.setValue(`questions.${questionIndex}.correctAnswer`, defaultOptions[0]);
        }
      }
    } else {
      // Clear options for non-multiple choice questions
      form.setValue(`questions.${questionIndex}.options`, undefined);
      if (questionType === QuestionType.TRUE_FALSE) {
        form.setValue(`questions.${questionIndex}.correctAnswer`, 'True');
      } else {
        form.setValue(`questions.${questionIndex}.correctAnswer`, '');
      }
    }
  }, [questionType, form, questionIndex]);

  // Clean up empty strings from options and validate correct answer
  useEffect(() => {
    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
      const validOptions = currentOptions.filter(opt => opt && opt.trim());
      
      // If we have empty strings, clean them up
      if (validOptions.length !== currentOptions.length) {
        // Only update if we still have at least 2 valid options
        if (validOptions.length >= 2) {
          form.setValue(`questions.${questionIndex}.options`, validOptions);
        } else if (validOptions.length < 2 && currentOptions.length >= 2) {
          // If we're about to go below 2, restore defaults
          const defaultOptions = ['Option 1', 'Option 2'];
          form.setValue(`questions.${questionIndex}.options`, defaultOptions);
          form.setValue(`questions.${questionIndex}.correctAnswer`, defaultOptions[0]);
          return;
        }
      }

      // Ensure correct answer is valid
      const currentAnswer = form.getValues(`questions.${questionIndex}.correctAnswer`);
      if (currentAnswer && !validOptions.includes(currentAnswer)) {
        // Current answer is not in valid options, set to first valid option
        if (validOptions.length > 0) {
          form.setValue(`questions.${questionIndex}.correctAnswer`, validOptions[0]);
        }
      }
    }
  }, [options, questionType, form, questionIndex]);

  const addOption = () => {
    appendOption(`Option ${options.length + 1}`);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <FormField
            label="Question"
            required
            error={form.formState.errors.questions?.[questionIndex]?.question?.message}
          >
            <Textarea
              {...form.register(`questions.${questionIndex}.question`)}
              placeholder="Enter your question here..."
              rows={2}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Question Type"
              required
              error={form.formState.errors.questions?.[questionIndex]?.type?.message}
            >
              <Select
                value={questionType}
                onValueChange={value => form.setValue(`questions.${questionIndex}.type`, value as QuestionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                  <SelectItem value={QuestionType.SHORT_ANSWER}>Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Points"
              error={form.formState.errors.questions?.[questionIndex]?.points?.message}
            >
              <Input
                type="number"
                min="0"
                {...form.register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                placeholder="Optional"
              />
            </FormField>
          </div>

          {/* Multiple Choice Options */}
          {questionType === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Options</label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {optionFields.map((field, optionIndex) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...form.register(`questions.${questionIndex}.options.${optionIndex}`, {
                      onBlur: (e) => {
                        const value = e.target.value.trim();
                        const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
                        const currentAnswer = form.getValues(`questions.${questionIndex}.correctAnswer`);
                        
                        // If option is cleared and we have more than 2 options, remove it
                        if (!value && currentOptions.length > 2) {
                          const optionToRemove = currentOptions[optionIndex];
                          removeOption(optionIndex);
                          
                          // If removed option was the correct answer, update it
                          if (currentAnswer === optionToRemove) {
                            const remainingOptions = currentOptions
                              .filter((_, idx) => idx !== optionIndex)
                              .filter(opt => opt && opt.trim());
                            if (remainingOptions.length > 0) {
                              form.setValue(`questions.${questionIndex}.correctAnswer`, remainingOptions[0]);
                            }
                          }
                        } else if (value) {
                          // Update with trimmed value
                          form.setValue(`questions.${questionIndex}.options.${optionIndex}`, value);
                        }
                      },
                    })}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (options.length > 2) {
                        const optionToRemove = options[optionIndex];
                        removeOption(optionIndex);
                        // If removed option was the correct answer, set first valid option as correct
                        const currentAnswer = form.getValues(`questions.${questionIndex}.correctAnswer`);
                        if (currentAnswer === optionToRemove) {
                          const remainingOptions = form.getValues(`questions.${questionIndex}.options`) || [];
                          const validOptions = remainingOptions.filter(opt => opt && opt.trim());
                          if (validOptions.length > 0) {
                            form.setValue(`questions.${questionIndex}.correctAnswer`, validOptions[0]);
                          }
                        }
                      }
                    }}
                    disabled={options.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.questions?.[questionIndex]?.options && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.questions[questionIndex]?.options?.message}
                </p>
              )}

              <FormField
                label="Correct Answer"
                required
                error={form.formState.errors.questions?.[questionIndex]?.correctAnswer?.message}
              >
                <Select
                  value={form.watch(`questions.${questionIndex}.correctAnswer`) || undefined}
                  onValueChange={value =>
                    form.setValue(`questions.${questionIndex}.correctAnswer`, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter(opt => opt && opt.trim()) // Filter out empty strings
                      .map((option, idx) => (
                        <SelectItem key={idx} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}

          {/* True/False Options */}
          {questionType === QuestionType.TRUE_FALSE && (
            <FormField
              label="Correct Answer"
              required
              error={form.formState.errors.questions?.[questionIndex]?.correctAnswer?.message}
            >
              <Select
                value={form.watch(`questions.${questionIndex}.correctAnswer`)}
                onValueChange={value =>
                  form.setValue(`questions.${questionIndex}.correctAnswer`, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          {/* Short Answer */}
          {questionType === QuestionType.SHORT_ANSWER && (
            <FormField
              label="Correct Answer"
              required
              error={form.formState.errors.questions?.[questionIndex]?.correctAnswer?.message}
            >
              <Input
                {...form.register(`questions.${questionIndex}.correctAnswer`)}
                placeholder="Enter the correct answer"
              />
            </FormField>
          )}
        </div>

        {canRemove && onRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="ml-4">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">{questionType.toString().replace(/_/g, ' ')}</Badge>
        {form.watch(`questions.${questionIndex}.points`) && (
          <Badge variant="outline">{form.watch(`questions.${questionIndex}.points`)} points</Badge>
        )}
      </div>
    </div>
  );
}
