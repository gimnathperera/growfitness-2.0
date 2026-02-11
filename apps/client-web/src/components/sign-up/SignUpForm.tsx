import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useHandleError } from '@/lib/errors';
import type { CreateParentDto } from '@grow-fitness/shared-schemas';
import SignupFlow from './SignUpFlow';
import { usersService } from '@/services/users.service'; 

const SignUpForm: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useHandleError();

  /**
   * Handle form submission
   */
  const handleSignupSubmit = async (data: CreateParentDto) => {
    try {
      setSubmitError(null);
      setIsLoading(true);

      // Normalize kid birth dates
      const processedData: CreateParentDto = {
        ...data,
        kids: data.kids.map((kid) => ({
          ...kid,
          birthDate:
            typeof kid.birthDate === 'string'
              ? kid.birthDate
              : kid.birthDate instanceof Date
              ? kid.birthDate.toISOString()
              : new Date(kid.birthDate).toISOString(),
        })),
      };

      // ✅ REAL API CALL
      const createdUser = await usersService.createParent(processedData);

      console.log('Created parent:', createdUser);

      toast({
        title: 'Account Created! 🎉',
        description: 'Welcome to Grow Fitness! Your account has been created successfully.',
      });

      // Decide where to go after signup
      navigate('/login'); // or '/dashboard'
    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);

      toast({
        title: 'Signup Failed',
        description: appError.message,
        variant: 'destructive',
      });
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

  /**
   * Success handler (optional if SignupFlow triggers it)
   */
  const handleSubmitSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="pt-20">
      <Toaster />
      <SignupFlow
        onSubmit={handleSignupSubmit}
        onCancel={handleCancel}
        onSubmitSuccess={handleSubmitSuccess}
        isLoading={isLoading}
        error={submitError}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default SignUpForm;
