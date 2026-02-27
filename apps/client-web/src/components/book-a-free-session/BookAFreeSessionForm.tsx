import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import CollectInfoFlow from './CollectInfoFlow';
import ConfettiCelebration from './ConfettiCelebration';
import { useHandleError } from '@/lib/errors';
import { requestsService } from '@/services/requests.service';
import { sessionsService } from '@/services/sessions.service';
import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';
import type { Session } from '@grow-fitness/shared-types';

interface SessionOption {
  value: string;
  label: string;
  dateTime: string;
  locationId: string;
}

const BookAFreeSessionForm: React.FC = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionOptions, setSessionOptions] = useState<SessionOption[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const handleError = useHandleError();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await sessionsService.getFreeSessions(1, 100);
        const sessions = response?.data ?? [];

        const now = new Date();

        const formattedSessions: SessionOption[] = sessions
          .filter((session: Session) => {
            return (
              session.dateTime &&
              new Date(session.dateTime).getTime() > now.getTime()
            );
          })
          .sort(
            (a: Session, b: Session) =>
              new Date(a.dateTime).getTime() -
              new Date(b.dateTime).getTime()
          )
          .map((session: Session) => {
            const dateObj = new Date(session.dateTime);

            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const formattedTime = dateObj.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            return {
              value: session.id,
              label: `${formattedDate} at ${formattedTime} - ${
                session.location?.name ?? 'Location'
              }`,
              dateTime: typeof session.dateTime === 'string' 
                ? session.dateTime 
                : session.dateTime.toISOString(),
              locationId: session.locationId,
            };
          });

        setSessionOptions(formattedSessions);
      } catch (error) {
        console.error('❌ ERROR FETCHING FREE SESSIONS:', error);
      }
    };

    fetchSessions();
  }, []);

  const handleCollectInfoSubmit = async (
    data: CreateFreeSessionRequestDto
  ) => {
    try {
      setSubmitError(null);
      setIsLoading(true);

      const selectedSession = sessionOptions.find(
        (s: SessionOption) => s.value === data.selectedSessionId
      );

      if (!selectedSession) {
        throw new Error('Selected session not found');
      }

      const dto: CreateFreeSessionRequestDto = {
        parentName: data.parentName,
        phone: data.phone,
        email: data.email,
        kidName: data.kidName,

        sessionType: SessionType.GROUP,

        selectedSessionId: selectedSession.value,
        locationId: selectedSession.locationId,
        preferredDateTime: new Date(
          selectedSession.dateTime
        ).toISOString(),
      };

      await requestsService.createFreeSessionRequest(dto);

      setShowConfetti(true);

      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/');
  const handleRetry = () => setSubmitError(null);

  return (
    <div className="pt-20">
      <Toaster />
      <CollectInfoFlow
        onSubmit={handleCollectInfoSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={submitError}
        onRetry={handleRetry}
        sessionOptions={sessionOptions}
      />
      <ConfettiCelebration
        isVisible={showConfetti}
        duration={5000}
        title="Request Submitted!"
        message="Your request has been recorded. We'll contact you soon to schedule your free session."
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
};

export default BookAFreeSessionForm;
