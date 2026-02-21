import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHandleError } from '@/lib/errors';
import type { CreateParentDto } from '@grow-fitness/shared-schemas';
import SignupFlow from './SignUpFlow';
import { usersService } from '@/services/users.service';

const SignUpForm: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useHandleError();

  const handleSignupSubmit = async (data: CreateParentDto) => {
    try {
      setSubmitError(null);
      setIsLoading(true);

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

      await usersService.createParent(processedData);

    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/');

  const handleSubmitSuccess = () => {
    navigate('/login');
  };

  return (
    <div className="pt-20">
      <SignupFlow
        onSubmit={handleSignupSubmit}
        onCancel={handleCancel}
        onSubmitSuccess={handleSubmitSuccess}
        isLoading={isLoading}
        error={submitError}
      />
    </div>
  );
};

export default SignUpForm;