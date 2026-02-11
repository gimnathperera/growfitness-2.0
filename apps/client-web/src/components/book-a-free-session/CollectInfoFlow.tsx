import React, { useState, useCallback } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import { CreateFreeSessionRequestSchema } from '@grow-fitness/shared-schemas';
import { collectInfoQuestions } from './collect-info.questions';
import QuestionRenderer from '../common/QuestionRenderer';
import ProgressBar from '../common/ProgressBar';
import ConfettiCelebration from './ConfettiCelebration';

interface CollectInfoFlowProps {
  onSubmit: (data: CreateFreeSessionRequestDto) => Promise<void> | void;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const CollectInfoFlow: React.FC<CollectInfoFlowProps> = ({
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

  const { control, trigger, getValues, formState: { errors } } = useForm<CreateFreeSessionRequestDto>({
    resolver: zodResolver(CreateFreeSessionRequestSchema),
    mode: 'onChange',
  });

  const currentQuestion = collectInfoQuestions[currentStep];
  const isLastStep = currentStep === collectInfoQuestions.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / collectInfoQuestions.length) * 100;

  const goToNext = useCallback(async () => {
    const valid = await trigger(currentQuestion.id);
    if (!valid) return;

    if (!isLastStep) setCurrentStep(prev => prev + 1);
    else {
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
  }, [currentQuestion.id, isLastStep, trigger, getValues, onSubmit]);

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
        <motion.div className="flex-1 flex flex-col w-full max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    {onRetry && (
                      <button type="button" onClick={onRetry} className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors">
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between items-center py-4 border-t border-amber-100 bg-white/70 backdrop-blur rounded-t-2xl shadow-md">
            <Button type="button" variant="outline" onClick={goToPrevious} disabled={isFirstStep} className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <div className="text-sm text-gray-500">{currentStep + 1} / {collectInfoQuestions.length}</div>

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 mr-5 !bg-emerald-500 !text-white hover:!bg-emerald-600 !border-0"
            >
              {isLoading || isSubmitting ? (
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              ) : isLastStep ? (
                <><Check className="w-4 h-4" /> Submit</>
              ) : (
                <><span>Next</span><ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
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

  const renderSuccess = () => (
    <motion.div className="flex flex-1 items-center justify-center text-center px-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-8 max-w-md w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
          <Check className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        </motion.div>
        <motion.h2 className="text-3xl font-bold text-gray-800 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          Request Submitted! 🎉
        </motion.h2>
        <motion.p className="text-gray-600 text-lg mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          Your request has been recorded. We'll contact you soon to schedule your free session.
        </motion.p>
        <Button onClick={onSubmitSuccess} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors transform hover:scale-105">
          Continue to Home
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col relative">
      {!isSubmitSuccess && !isSubmitting ? renderForm() : isSubmitting ? renderSubmitting() : renderSuccess()}
      <ConfettiCelebration
        isVisible={isSubmitSuccess}
        duration={5000}
        title="Request Submitted!"
        message="We'll contact you soon to schedule your free session."
        onComplete={onSubmitSuccess}
      />
    </div>
  );
};

export default CollectInfoFlow;
