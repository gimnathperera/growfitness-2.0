import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, type FieldError, type Path,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSubmitError } from '@/components/ui/form-submit-error';
import type { CreateParentDto } from '@grow-fitness/shared-schemas';
import { CreateParentSchema } from '@grow-fitness/shared-schemas';
import {
  parentQuestions,
  kidsNamesQuestion,
  kidAttributeQuestions,
} from './SignUpQuestions';
import QuestionRenderer from '../common/QuestionRenderer';
import ProgressBar from '../common/ProgressBar';
import ConfettiCelebration from './ConfettiCelebration';
import type { SessionType } from '@grow-fitness/shared-types';

interface SignupFlowProps {
  onSubmit: (data: CreateParentDto) => Promise<void> | void;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type StepConfig =
  | { type: 'parent'; questionIndex: number }
  | { type: 'kids-names' }
  | { type: 'kid-attribute'; attributeIndex: number };

const createEmptyKid = () => ({
  name: '',
  gender: '',
  birthDate: '',
  goal: '',
  currentlyInSports: false,
  medicalConditions: [] as string[],
  sessionType: '' as SessionType,
});

const SignupFlow: React.FC<SignupFlowProps> = ({
  onSubmit,
  onCancel,
  onSubmitSuccess,
  isLoading = false,
  error,
  onRetry,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [kidHasMedicalConditions, setKidHasMedicalConditions] = useState<Record<number, boolean>>({});
  const {
    control,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateParentDto>({
    resolver: zodResolver(CreateParentSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      password: '',
      confirmPassword: '',
      kids: [createEmptyKid()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'kids',
  });

  const kids = watch('kids');

  // Build step configuration
  const steps: StepConfig[] = [
    ...parentQuestions.map((_, index) => ({ type: 'parent' as const, questionIndex: index })),
    { type: 'kids-names' as const },
    ...kidAttributeQuestions.map((_, index) => ({ type: 'kid-attribute' as const, attributeIndex: index })),
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleAddKid = () => {
    append(createEmptyKid());
  };

  const handleRemoveKid = (index: number) => {
    if (fields.length === 1) return;
    remove(index);
  };

  const getFieldsToValidate = useCallback(() => {
    if (currentStepConfig.type === 'parent') {
      const question = parentQuestions[currentStepConfig.questionIndex];
      return [question.id];
    }

    if (currentStepConfig.type === 'kids-names') {
      return fields.map((_, index) => `kids.${index}.name` as keyof CreateParentDto['kids']);
    }

    // Kid attribute
    const attribute = kidAttributeQuestions[currentStepConfig.attributeIndex];
    return fields.map((_, index) => `kids.${index}.${attribute.id}` as keyof CreateParentDto['kids']);
  }, [currentStepConfig, fields]);

  const goToNext = useCallback(async () => {
    const fieldsToValidate = getFieldsToValidate() as Array<Path<CreateParentDto>>;
    const valid = await trigger(fieldsToValidate as Path<CreateParentDto>[]) as boolean; 
    
    if (!valid) return;

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const data = getValues();
      setIsSubmitting(true);
      try {
        await onSubmit(data);
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSubmitSuccess(true);
        }, 1500);
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    }
  }, [getFieldsToValidate, isLastStep, trigger, getValues, onSubmit]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  }, [isFirstStep]);

  const renderCurrentStep = () => {
    if (currentStepConfig.type === 'parent') {
      const question = parentQuestions[currentStepConfig.questionIndex];
      return (
        <div className="space-y-6">
          <QuestionRenderer
            question={{
              id: question.id,
              type: question.type,
              placeholder: question.placeholder,
              options: question.options,
              required: question.required,
            }}
            control={control}
            error={errors[question.id] as FieldError | undefined}
            passwordValue={question.type === 'confirmPassword' ? watch('password') : undefined}
          />
        </div>
      );
    }

    if (currentStepConfig.type === 'kids-names') {
      return (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 rounded-xl border border-amber-100 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Child {index + 1}
                </h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveKid(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove child {index + 1}</span>
                  </Button>
                )}
              </div>

             <div className="space-y-3">
                <QuestionRenderer
                  question={{
                    id: `kids.${index}.name` as const,
                    type: 'text',
                    placeholder: "Child's name",
                    required: true,
                  }}
                  control={control}
                  error={errors.kids?.[index]?.name as FieldError | undefined}
                  shouldAutoFocus={index === 0}
                />
              </div>
            </motion.div>
          ))}

          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddKid}
              className="flex items-center gap-2 px-4 py-2 !border-emerald-200 !text-emerald-600 !bg-emerald-50 hover:!bg-emerald-100"
            >
              <Plus className="h-4 w-4" />
              Add another child
            </Button>
          </div>
        </div>
      );
    }

    // Kid attribute
    const attribute = kidAttributeQuestions[currentStepConfig.attributeIndex];
    return (
      <div className="space-y-4">
        {fields.map((field, index) => {
          const kid = kids?.[index];
          const kidName = kid?.name?.trim() || `Child ${index + 1}`;
          const label = attribute.perChildLabel?.replace('{name}', kidName) || attribute.title.replace('{name}', kidName);

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 rounded-xl border border-amber-100 p-4"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
              </div>

              {attribute.id === 'medicalConditions' ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:gap-4 w-full">
                    <motion.button
                      type="button"
                      onClick={() => setKidHasMedicalConditions(prev => ({ ...prev, [index]: true }))}
                      className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${
                        kidHasMedicalConditions[index] === true
                          ? '!border-emerald-500 !bg-emerald-50 shadow-md'
                          : '!border-amber-200 !bg-amber-50 hover:border-amber-300 hover:!bg-amber-100'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <span className="text-base sm:text-lg font-medium text-gray-900">
                            Yes
                          </span>
                        </div>
                        {kidHasMedicalConditions[index] === true && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setKidHasMedicalConditions(prev => ({ ...prev, [index]: false }));
                        // Clear medical conditions if "No" is selected
                        const kidValues = getValues(`kids.${index}`);
                        if (kidValues) {
                          control._fields[`kids.${index}.medicalConditions` as any]?._f.ref?.focus();
                        }
                      }}
                      className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md ${
                        kidHasMedicalConditions[index] === false
                          ? '!border-emerald-500 !bg-emerald-50 shadow-md'
                          : '!border-amber-200 !bg-amber-50 hover:border-amber-300 hover:!bg-amber-100'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <span className="text-base sm:text-lg font-medium text-gray-900">
                            No
                          </span>
                        </div>
                        {kidHasMedicalConditions[index] === false && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {kidHasMedicalConditions[index] === true && (
                    <QuestionRenderer
                      question={{
                        id: `kids.${index}.${attribute.id}` as const,
                        type: attribute.type,
                        placeholder: attribute.placeholder,
                        options: attribute.options,
                        required: attribute.required,
                      }}
                      control={control}
                      error={errors.kids?.[index]?.[attribute.id] as FieldError | undefined}
                      shouldAutoFocus={index === 0}
                    />
                  )}
                </div>
              ) : (
                <QuestionRenderer
                  question={{
                    id: `kids.${index}.${attribute.id}` as const,
                    type: attribute.type,
                    placeholder: attribute.placeholder,
                    options: attribute.options,
                    required: attribute.required,
                  }}
                  control={control}
                  error={errors.kids?.[index]?.[attribute.id] as FieldError | undefined}
                  shouldAutoFocus={index === 0}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const getCurrentTitle = () => {
    if (currentStepConfig.type === 'parent') {
      return parentQuestions[currentStepConfig.questionIndex].title;
    }
    if (currentStepConfig.type === 'kids-names') {
      return kidsNamesQuestion.title;
    }
    return kidAttributeQuestions[currentStepConfig.attributeIndex].title.replace('{name}', '');
  };

  const getCurrentSubtitle = () => {
    if (currentStepConfig.type === 'parent') {
      return parentQuestions[currentStepConfig.questionIndex].subtitle;
    }
    if (currentStepConfig.type === 'kids-names') {
      return kidsNamesQuestion.subtitle;
    }
    return kidAttributeQuestions[currentStepConfig.attributeIndex].subtitle;
  };

  const renderForm = () => (
    <>
      {/* <ProgressBar
        progress={progress}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
      /> */}

      <div className="flex-1 flex flex-col px-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            goToNext();
          }}
          className="flex-1 flex flex-col w-full max-w-2xl mx-auto"
        >
          <div className="flex-1 flex flex-col justify-center py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {getCurrentTitle()}
                  </h1>
                  {getCurrentSubtitle() && (
                    <p className="text-gray-600 mt-2">{getCurrentSubtitle()}</p>
                  )}
                </div>

                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mb-4"
            >
              <FormSubmitError message={error} onRetry={onRetry} />
            </motion.div>
          )}

          <div className="flex justify-between items-center py-4 border-t px-4 border-amber-100 bg-white/70 backdrop-blur rounded-t-2xl shadow-md">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} / {totalSteps}
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 !bg-emerald-500 !text-white hover:!bg-emerald-600 !border-0"
            >
              {isLoading || isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : isLastStep ? (
                <>
                  <Check className="w-4 h-4" /> Complete Signup
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {onCancel && (
        <div className="p-4 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  );

  const renderSubmitting = () => (
    <motion.div
      className="flex flex-1 items-center justify-center text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-8 max-w-md w-full">
        <motion.div
          className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Sending Your Request...
        </h2>
        <p className="text-gray-600">
          Please wait while we submit your request for review.
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col relative">
      {!isSubmitSuccess && !isSubmitting
        ? renderForm()
        : isSubmitting
        ? renderSubmitting()
        : null}
      <ConfettiCelebration
        isVisible={isSubmitSuccess}
        duration={5000}
        title="Request Submitted!"
        message="Your parent registration request has been sent to the admin for review. You will be notified once it is approved."
        onComplete={onSubmitSuccess}
      />
    </div>
  );
};

export default SignupFlow;