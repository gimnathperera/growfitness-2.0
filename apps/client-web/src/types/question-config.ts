import type { ReactNode } from 'react';

/**
 * Generic reusable question configuration for forms
 */
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
    | 'multiselect';
  options?: {
    value: string | boolean;
    label: string;
    icon?: ReactNode;
  }[];
  required?: boolean;
};