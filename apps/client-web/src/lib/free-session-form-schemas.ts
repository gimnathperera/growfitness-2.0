import { z } from 'zod';

/** Aligned with @grow-fitness/shared-schemas field-validators (Zod v3 there; defined locally for Zod v4). */
const PHONE_REGEX = /^(\+?\d{1,3}[- ]?)?\d{10,12}$/;
const PERSON_NAME_CHARS_REGEX = /^[a-zA-Z][a-zA-Z\s'.-]*$/;

function personNameField(options: { fieldLabel: string; requireFullName?: boolean }) {
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

/** Wizard fields only — avoids validating sessionType/locationId before they exist. */
export const FreeSessionFormSchema = z.object({
  parentName: personNameField({
    fieldLabel: 'your full name',
    requireFullName: true,
  }),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number.')
    .regex(
      PHONE_REGEX,
      'Enter a valid mobile number (e.g., +94771234567 or 0771234567).'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  kidName: personNameField({ fieldLabel: "your child's name" }),
  selectedSessionId: z.string().min(1, 'Select an available session.'),
});

export type FreeSessionFormValues = z.infer<typeof FreeSessionFormSchema>;

export const freeSessionStepSchemas = {
  parentName: FreeSessionFormSchema.shape.parentName,
  phone: FreeSessionFormSchema.shape.phone,
  email: FreeSessionFormSchema.shape.email,
  kidName: FreeSessionFormSchema.shape.kidName,
  selectedSessionId: FreeSessionFormSchema.shape.selectedSessionId,
};

export type FreeSessionStepField = keyof typeof freeSessionStepSchemas;

export function validateFreeSessionStepField(
  field: FreeSessionStepField,
  value: unknown
): { success: true } | { success: false; message: string } {
  const schema = freeSessionStepSchemas[field];
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true };
  }
  const message = result.error.issues[0]?.message ?? 'This field is invalid.';
  return { success: false, message };
}
