import type { ReactNode } from 'react';

export type QuestionOption = {
  value: string | boolean;
  label: string;
  icon?: ReactNode;
};

export type QuestionConfig<T extends string> = {
  id: T;
  label?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'number'
    | 'textarea'
    | 'date'
    | 'datetime'
    | 'phone'
    | 'select'
    | 'multiselect'
    | 'boolean';
  options?: QuestionOption[] | (() => Promise<QuestionOption[]>);
  required?: boolean;
};