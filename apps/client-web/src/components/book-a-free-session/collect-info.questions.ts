import { sessionsService } from '@/services/sessions.service';
import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import { SessionType, type SessionStatus } from '@grow-fitness/shared-types';
import type { QuestionConfig, QuestionOption } from '@/types/question-config';

const fetchFreeSessions = async (): Promise<QuestionOption[]> => {
  try {
    const today = new Date().toISOString();
    
    const response = await sessionsService.getSessions(
      1,
      100,
      {
        status: 'FREE' as SessionStatus,
        startDate: today,
      }
    );
    
    return (response.data || []).map(session => {
      const dateTime = new Date(session.dateTime);
      const formattedDate = dateTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = dateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return {
        value: session.id,
        label: `${formattedDate} at ${formattedTime}`,
      };
    });
  } catch (error) {
    // Log the full error to see what's happening
    console.error('Error fetching free sessions:', error);
    
    // Return empty array instead of throwing
    // This prevents auth redirects
    return [];
  }
};

export const collectInfoQuestions: QuestionConfig<keyof CreateFreeSessionRequestDto>[] = [
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
    id: 'sessionType',
    type: 'select',
    title: 'What type of session are you interested in?',
    required: true,
    options: [
      { value: SessionType.INDIVIDUAL, label: 'Individual Session' },
      { value: SessionType.GROUP, label: 'Group Session' },
    ],
  },
  {
    id: 'locationId',
    type: 'text',
    title: 'Preferred Location',
    placeholder: 'Enter location',
    required: true,
  },
  {
    id: 'selectedSessionId',
    type: 'select',
    title: 'Select Available Session',
    required: true,
    subtitle: 'Choose from available date and time slots',
    options: fetchFreeSessions,
  },
];