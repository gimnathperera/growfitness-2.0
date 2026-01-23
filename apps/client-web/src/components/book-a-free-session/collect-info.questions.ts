import type { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';

interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  id: keyof CreateFreeSessionRequestDto;
  type: 'text' | 'email' | 'phone' | 'select';
  title: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  subtitle?: string;
}

export const collectInfoQuestions: Question[] = [
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
    id: 'selectedSessionId',
    type: 'text',
    title: 'Session ID (if you have a specific session in mind)',
    placeholder: 'Enter session ID (optional)',
    required: true,
  },
];
