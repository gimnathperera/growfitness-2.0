import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import CollectInfoFlow from './CollectInfoFlow';
import { useHandleError } from '@/lib/errors';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { requestsService } from '@/services/requests.service';

const BookAFreeSessionForm: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useHandleError();  // Moved to the top level

  const handleCollectInfoSubmit = async (data: CreateFreeSessionRequestDto) => {
    try {
      setSubmitError(null);
      setIsLoading(true);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      await Promise.race([
        requestsService.selectFreeSessionRequest(data.selectedSessionId),
        timeoutPromise,
      ]);

      toast({
        title: 'Success',
        description:
          "🎉 Request submitted successfully! We'll contact you soon to schedule your free session.",
      });

      navigate('/');
    } catch (error) {
      const appError = handleError(error);  // Using the function returned by the hook
      setSubmitError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
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
        onSubmitSuccess={() => navigate('/')}
        isLoading={isLoading}
        error={submitError}
        onRetry={handleRetry}
      />
    </>
  );
};

export default BookAFreeSessionForm;
