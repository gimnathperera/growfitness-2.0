import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import { useCreateCollectInfoMutation } from '@/services/collectInfoApi';
import CollectInfoFlow from './CollectInfoFlow';
import { useHandleError } from '@/lib/errors'; 
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const CollectInfoPage: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [createCollectInfo, { isLoading }] = useCreateCollectInfoMutation();

  const handleCollectInfoSubmit = async (data: CreateFreeSessionRequestDto) => {
    try {
      setSubmitError(null);

      // 30-second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      await Promise.race([createCollectInfo(data).unwrap(), timeoutPromise]);

      // Show success toast
      toast({
        title: 'Success',
        description: "🎉 Request submitted successfully! We'll contact you soon to schedule your free session.",
        variant: 'default',
      });

      // Optional: navigate or trigger confetti
    } catch (error) {
      // Use centralized error handler
      const appError = useHandleError(error);

      // Show inline error if needed
      setSubmitError(appError.message);
    } 
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmitSuccess = () => {
    navigate('/');
  };

  const handleRetry = () => {
    setSubmitError(null);
  };

  return (
    <>
      <Toaster />
      <CollectInfoFlow
        onSubmit={handleCollectInfoSubmit}
        onCancel={handleCancel}
        onSubmitSuccess={handleSubmitSuccess}
        isLoading={isLoading}
        error={submitError}
        onRetry={handleRetry}
      />
    </>
  );
};

export default CollectInfoPage;
