import type { ReactNode } from 'react';

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
    | 'number'
    | 'textarea'
    | 'date'
    | 'datetime'
    | 'phone'
    | 'select'
    | 'multiselect'
    | 'boolean';
  options?: {
    value: string | boolean;
    label: string;
    icon?: ReactNode;
  }[];
  required?: boolean;
};