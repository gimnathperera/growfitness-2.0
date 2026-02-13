import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import type { Session } from '@grow-fitness/shared-types';
import type { QuestionConfig, QuestionOption } from '@/types/question-config';
import { sessionsService } from '@/services/sessions.service';

interface SessionOption extends QuestionOption {
  value: string;
  label: string;
  dateTime: Date | string;
  locationId: string;
}

const fetchFreeSessions = async (): Promise<SessionOption[]> => {
  try {
    const now = new Date();

    const response = await sessionsService.getFreeSessions(1, 100);
    const sessions = response?.data ?? [];

    if (!sessions.length) {
      return [];
    }

    const filteredAndSorted = sessions
      .filter((session: Session) => {
        return (
          session?.dateTime &&
          new Date(session.dateTime).getTime() > now.getTime()
        );
      })
      .sort(
        (a: Session, b: Session) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime()
      );

    const mappedOptions = filteredAndSorted.map((session: Session) => {
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
          dateTime: new Date(session.dateTime),
          locationId: session.locationId,
        };
      }
    );

    return mappedOptions;
  } catch (error) {
    console.error('❌ ERROR FETCHING FREE SESSIONS:', error);
    return [];
  }
};

export const collectInfoQuestions: QuestionConfig<
  keyof CreateFreeSessionRequestDto
>[] = [
  {
    id: 'parentName',
    type: 'text',
    title: "What's your full name?",
    placeholder: 'Enter your full name',
    required: true,
  },
  {
    id: 'phone',
    type: 'phone',
    title: "What's your phone number?",
    placeholder: 'Enter your phone number',
    required: true,
  },
  {
    id: 'email',
    type: 'email',
    title: "What's your email address?",
    placeholder: 'Enter your email',
    required: true,
  },
  {
    id: 'kidName',
    type: 'text',
    title: "What's your child's name?",
    placeholder: "Enter your child's name",
    required: true,
  },
  {
    id: 'selectedSessionId',
    type: 'select',
    title: 'Select Available Session',
    subtitle: 'Choose from available date, time & location',
    required: true,
    options: async () => {
      return await fetchFreeSessions();
    },
  },
];

