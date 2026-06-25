import React, { useState, useCallback } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSubmitError } from '@/components/ui/form-submit-error';
import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import {
  FreeSessionFormSchema,
  validateFreeSessionStepField,
  type FreeSessionFormValues,
  type FreeSessionStepField,
} from '@/lib/free-session-form-schemas';
import { collectInfoQuestions } from './collect-info.questions';
import QuestionRenderer from '../common/QuestionRenderer';
import ProgressBar from '../common/ProgressBar';

interface CollectInfoFlowProps {
  onSubmit: (data: CreateFreeSessionRequestDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  sessionOptions: {
    value: string;
    label: string;
  }[];
}


const CollectInfoFlow: React.FC<CollectInfoFlowProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  onRetry,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FreeSessionFormValues>({
    resolver: zodResolver(FreeSessionFormSchema),
    mode: 'onChange',
    defaultValues: {
      parentName: '',
      phone: '',
      email: '',
      kidName: '',
      selectedSessionId: '',
    },
  });

  const currentQuestion = collectInfoQuestions[currentStep];
  const isLastStep = currentStep === collectInfoQuestions.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / collectInfoQuestions.length) * 100;
  const selectedSessionId = watch('selectedSessionId');
  const hasSessionSelected = Boolean(selectedSessionId?.trim());

  const goToNext = useCallback(async () => {
    const field = currentQuestion.id as FreeSessionStepField;
    const value = getValues(field);

    clearErrors(field);

    const stepResult = validateFreeSessionStepField(field, value);
    if (!stepResult.success) {
      setError(field, { type: 'manual', message: stepResult.message });
      return;
    }

    if (!isLastStep) setCurrentStep(prev => prev + 1);
    else {
      const data = getValues();
      setIsSubmitting(true);
      try {
        await onSubmit(data as CreateFreeSessionRequestDto);
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSubmitSuccess(true);
        }, 1500);
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    }
  }, [currentQuestion.id, isLastStep, getValues, setError, clearErrors, onSubmit]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1);
  }, [isFirstStep]);

  // --- Render helpers ---
  const renderForm = () => (
    <>
      <ProgressBar progress={progress} currentStep={currentStep + 1} totalSteps={collectInfoQuestions.length} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToNext();
        }}
        className="flex-1 flex flex-col px-4"
      >
        <motion.div className="flex-1 flex flex-col w-full max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  <h1 className="text-2xl font-bold text-gray-800">{currentQuestion.title}</h1>
                  {currentQuestion.subtitle && <p className="text-gray-600">{currentQuestion.subtitle}</p>}
                </div>
                <QuestionRenderer question={currentQuestion} control={control} error={errors[currentQuestion.id] as FieldError | undefined} />
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 mb-4">
              <FormSubmitError message={error} onRetry={onRetry} />
            </motion.div>
          )}

          <div className="flex items-center gap-3 border-t border-amber-100 bg-white/70 backdrop-blur rounded-t-2xl shadow-md px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex min-w-0 flex-1 justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevious}
                disabled={isFirstStep}
                className="flex shrink-0 items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            </div>

            <div className="flex shrink-0 items-center justify-center px-2 text-sm tabular-nums text-gray-500">
              {currentStep + 1} / {collectInfoQuestions.length}
            </div>

            <div className="flex min-w-0 flex-1 justify-end">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  isSubmitting ||
                  (isLastStep && !hasSessionSelected)
                }
                className="flex shrink-0 items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 !border-0 !bg-emerald-500 !text-white hover:!bg-emerald-600"
              >
                {isLoading || isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isLastStep ? (
                  <>
                    <Check className="h-4 w-4" /> Submit
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </form>

      {onCancel && (
        <div className="p-4 text-center">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-600 hover:text-gray-800">Cancel</Button>
        </div>
      )}
    </>
  );

  const renderSubmitting = () => (
    <motion.div className="flex flex-1 items-center justify-center text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-8 max-w-md w-full">
        <motion.div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          <motion.div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Submitting Your Request...</h2>
        <p className="text-gray-600">Please wait while we process your information.</p>
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

    </div>
  );
};

export default CollectInfoFlow;
