import { z } from 'zod';

/** Mobile numbers: optional country code + 10–12 digits (e.g. +94771234567, 0771234567). */
export const PHONE_REGEX = /^(\+?\d{1,3}[- ]?)?\d{10,12}$/;

const PERSON_NAME_CHARS_REGEX = /^[a-zA-Z][a-zA-Z\s'.-]*$/;

export type PersonNameOptions = {
  fieldLabel: string;
  /** When true, requires at least two name parts (e.g. first and last). */
  requireFullName?: boolean;
};

export function personNameField(options: PersonNameOptions) {
  const { fieldLabel, requireFullName = false } = options;
  const label = fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);

  return z
    .string()
    .trim()
    .min(1, `Enter ${fieldLabel}.`)
    .min(2, `${label} must be at least 2 characters.`)
    .max(100, `${label} must be at most 100 characters.`)
    .regex(
      PERSON_NAME_CHARS_REGEX,
      `${label} can only contain letters, spaces, hyphens, and apostrophes.`
    )
    .refine(
      val => val.replace(/[^a-zA-Z]/g, '').length >= 2,
      `${label} must include at least 2 letters.`
    )
    .refine(
      val => !requireFullName || val.split(/\s+/).filter(Boolean).length >= 2,
      `Enter ${fieldLabel} (first and last name).`
    );
}

export function phoneField(fieldLabel = 'your phone number') {
  return z
    .string()
    .trim()
    .min(1, `Enter ${fieldLabel}.`)
    .regex(
      PHONE_REGEX,
      'Enter a valid mobile number (e.g., +94771234567 or 0771234567).'
    );
}
