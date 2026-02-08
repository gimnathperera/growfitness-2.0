import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import CollectInfoFlow from './CollectInfoFlow';
import { useHandleError } from '@/lib/errors';
import { requestsService } from '@/services/requests.service';
import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';

const BookAFreeSessionForm: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useHandleError();

  /**
   * Handle form submission
   */
  const handleCollectInfoSubmit = async (data: CreateFreeSessionRequestDto) => {
    try {
      setSubmitError(null);
      setIsLoading(true);

      // Map/convert fields if necessary
      const dto: CreateFreeSessionRequestDto = {
        ...data,
        selectedSessionId: data.selectedSessionId ? String(data.selectedSessionId) : undefined,
        preferredDateTime:
          typeof data.preferredDateTime === 'string'
            ? data.preferredDateTime
            : data.preferredDateTime.toISOString(),
      };

      // 30s timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      await Promise.race([requestsService.createFreeSessionRequest(dto), timeoutPromise]);

      toast({
        title: 'Request Submitted!',
        description: '🎉 Your free session request has been submitted. Our team will get back to you soon!',
      });

      navigate('/');
    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel handler
   */
  const handleCancel = () => navigate('/');

  /**
   * Retry handler
   */
  const handleRetry = () => setSubmitError(null);

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
