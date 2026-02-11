import type { CreateParentDto } from '@grow-fitness/shared-schemas';
import { SessionType } from '@grow-fitness/shared-types';

interface QuestionOption {
  value: string;
  label: string;
}

type ParentFieldPath = keyof Omit<CreateParentDto, 'kids'>;
type KidFieldPath = keyof CreateParentDto['kids'][number];

interface BaseQuestion {
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'multiselect' | 'textarea' | 'password' | 'number' | 'datetime' | 'boolean';
  title: string;
  subtitle?: string;
  placeholder?: string;
  required: boolean;
  options?: QuestionOption[];
  booleanOptions?: boolean; 
}

interface ParentQuestion extends BaseQuestion {
  id: ParentFieldPath;
  section: 'parent';
}

interface KidQuestion extends BaseQuestion {
  id: KidFieldPath;
  section: 'kid';
  perChildLabel?: string; // Template string with {name} placeholder
}

interface KidsNamesQuestion {
  id: 'kids-names';
  section: 'kids-names';
  type: 'kids-names';
  title: string;
  subtitle: string;
  required: true;
}

export type SignupQuestion = ParentQuestion | KidQuestion | KidsNamesQuestion;

// Parent information questions
export const parentQuestions: ParentQuestion[] = [
  {
    id: 'name',
    section: 'parent',
    type: 'text',
    title: "What's your full name?",
    subtitle: "Let's start with the basics",
    placeholder: 'Enter your full name',
    required: true,
  },
  {
    id: 'email',
    section: 'parent',
    type: 'email',
    title: "What's your email address?",
    subtitle: "We'll use this to keep you updated",
    placeholder: 'your.email@example.com',
    required: true,
  },
  {
    id: 'phone',
    section: 'parent',
    type: 'phone',
    title: "What's your phone number?",
    subtitle: 'So we can reach you quickly if needed',
    placeholder: '+1 (555) 000-0000',
    required: true,
  },
  {
    id: 'location',
    section: 'parent',
    type: 'text',
    title: 'Where are you located?',
    subtitle: 'This helps us find the best sessions near you',
    placeholder: 'City, State or ZIP code',
    required: false,
  },
  {
    id: 'password',
    section: 'parent',
    type: 'text',
    title: 'Create a secure password',
    subtitle: 'Must be at least 6 characters',
    placeholder: 'Enter a strong password',
    required: true,
  },
];

// Kids names question (special multi-kid entry)
export const kidsNamesQuestion: KidsNamesQuestion = {
  id: 'kids-names',
  section: 'kids-names',
  type: 'kids-names',
  title: "What are your kids' names?",
  subtitle: 'Add each child below. You can add multiple kids at once.',
  required: true,
};

// Kid attribute questions (asked for each kid)
export const kidAttributeQuestions: KidQuestion[] = [
  {
    id: 'gender',
    section: 'kid',
    type: 'select',
    title: "What is {name}'s gender?",
    perChildLabel: "{name}'s gender",
    placeholder: 'Select gender',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'birthDate',
    section: 'kid',
    type: 'date',
    title: "When is {name}'s birthday?",
    perChildLabel: "{name}'s date of birth",
    placeholder: 'Select date of birth',
    required: true,
  },
  {
    id: 'goal',
    section: 'kid',
    type: 'text',
    title: "What are {name}'s fitness goals?",
    subtitle: 'e.g., Build strength, improve coordination, make friends',
    perChildLabel: "{name}'s fitness goals",
    placeholder: 'Describe their goals',
    required: false,
  },
  {
    id: 'currentlyInSports',
    section: 'kid',
    type: 'boolean',
    title: 'Is {name} currently involved in sports?',
    perChildLabel: 'Currently in sports',
    required: true,
  },
  {
    id: 'medicalConditions',
    section: 'kid',
    type: 'multiselect',
    title: 'Does {name} have any medical conditions we should know about?',
    subtitle: 'Select all that apply, or leave blank if none',
    perChildLabel: "{name}'s medical conditions",
    placeholder: 'Select conditions',
    required: false,
    options: [
      { value: 'asthma', label: 'Asthma' },
      { value: 'allergies', label: 'Allergies' },
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'heart_condition', label: 'Heart Condition' },
      { value: 'joint_issues', label: 'Joint Issues' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'sessionType',
    section: 'kid',
    type: 'select',
    title: 'What type of session would {name} prefer?',
    perChildLabel: 'Preferred session type',
    required: true,
    options: [
      { value: SessionType.INDIVIDUAL, label: 'Individual (One-on-one training)' },
      { value: SessionType.GROUP, label: 'Group (Train with others)' },
    ],
  },
];

// Build the complete flow
export const signupQuestions: SignupQuestion[] = [
  ...parentQuestions,
  kidsNamesQuestion,
  ...kidAttributeQuestions,
];