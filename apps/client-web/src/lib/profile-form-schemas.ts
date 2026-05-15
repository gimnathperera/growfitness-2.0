import { z } from 'zod';
import type { ZodIssue } from 'zod';

/** Same pattern as @grow-fitness/shared-schemas CreateParent / UpdateParentSelf phone rules. */
const PHONE_REGEX = /^(\+?\d{1,3}[- ]?)?\d{10,12}$/;

const MAX_ADDRESS_LEN = 500;

export const parentProfileFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim(),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number.')
    .regex(
      PHONE_REGEX,
      'Enter a valid mobile number (e.g., +94771234567 or 0771234567).'
    ),
  address: z
    .string()
    .trim()
    .max(MAX_ADDRESS_LEN, `Address must be at most ${MAX_ADDRESS_LEN} characters.`),
});

export type ParentProfileFormInput = z.infer<typeof parentProfileFormSchema>;

export function parseParentProfileForm(input: ParentProfileFormInput) {
  return parentProfileFormSchema.safeParse(input);
}

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export const kidProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your child's name."),
  gender: z
    .string()
    .min(1, 'Select a gender.')
    .refine((v): v is (typeof GENDERS)[number] => GENDERS.includes(v as (typeof GENDERS)[number]), {
      message: 'Select a valid gender.',
    }),
  birthDate: z
    .string()
    .min(1, 'Select a birth date.')
    .refine(val => !Number.isNaN(Date.parse(val)), 'Enter a valid birth date.')
    .refine(val => {
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d <= today;
    }, 'Birth date cannot be in the future.')
    .refine(val => {
      const y = new Date(val).getFullYear();
      return y >= 1900;
    }, 'Birth year must be 1900 or later.'),
  goal: z.string().max(2000, 'Fitness goal must be at most 2000 characters.'),
});

export type KidProfileFormInput = z.infer<typeof kidProfileFormSchema>;

export function zodFieldErrorMap(issues: ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && out[key] === undefined) {
      out[key] = issue.message;
    }
  }
  return out;
}
