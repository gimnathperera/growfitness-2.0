import { z } from 'zod';
import {
  SessionType,
  SessionStatus,
  InvoiceType,
  BannerTargetAudience,
  QuestionType,
  ReportType,
  EmploymentType,
  UploadKind,
} from '@grow-fitness/shared-types';
import { personNameField, phoneField } from './field-validators';

export { PHONE_REGEX, personNameField, phoneField } from './field-validators';
export type { PersonNameOptions } from './field-validators';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Use at least 6 characters for your password.'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

/** Sign-up / create-parent: digits only, 10–15 characters. */
const signupPhoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter your phone number.')
  .regex(/^\d+$/, 'Phone number must contain only digits.')
  .refine(s => s.length >= 10 && s.length <= 15, {
    message: 'Enter a phone number with 10 to 15 digits.',
  });

/** Sign-up / create-parent password policy. */
const signupPasswordSchema = z
  .string()
  .min(1, 'Enter a password.')
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Include at least one uppercase letter.')
  .regex(/[a-z]/, 'Include at least one lowercase letter.')
  .regex(/[0-9]/, 'Include at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Include at least one special character.');

function parseBirthDateInput(val: string | Date): Date | null {
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  const s = val.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    const local = new Date(y, m, d);
    return isNaN(local.getTime()) ? null : local;
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

const kidBirthDateSchema = z.union([z.string(), z.date()]).superRefine((val, ctx) => {
  const parsed = parseBirthDateInput(val);
  if (!parsed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid date.',
    });
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  if (birthDay > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Birthday cannot be in the future.',
    });
  }
});

// User Schemas
const CreateParentBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .min(3, 'Full name must be at least 3 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  phone: signupPhoneSchema,
  location: z.string().trim().min(1, 'Enter your location.'),
  password: signupPasswordSchema,
  confirmPassword: signupPasswordSchema,
  kids: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, 'Enter the child\'s name.'),
        gender: z.string().min(1, 'Select a gender.'),
        birthDate: kidBirthDateSchema,
        goal: z.string().optional(),
        currentlyInSports: z.boolean(),
        medicalConditions: z.array(z.string()).default([]),
        sessionType: z.nativeEnum(SessionType),
      })
    )
    .min(1, 'Add at least one child.'),
});

export const CreateParentSchema = CreateParentBaseSchema.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match. Enter the same password in both fields.",
      path: ['confirmPassword'],
    });
  }
});

export { CreateParentBaseSchema };

export type CreateParentDto = z.infer<typeof CreateParentSchema>;

export const UpdateParentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  location: z.string().optional(),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type UpdateParentDto = z.infer<typeof UpdateParentSchema>;

/** Parent self-service PATCH /users/me/profile (no email or status). */
export const UpdateParentSelfSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z
    .string()
    .min(1, 'Enter your phone number.')
    .regex(
      /^(\+?\d{1,3}[- ]?)?\d{10,12}$/,
      'Enter a valid mobile number (e.g., +94771234567 or 0771234567).'
    )
    .optional(),
  location: z.string().optional(),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export type UpdateParentSelfDto = z.infer<typeof UpdateParentSelfSchema>;

const AvailableTimeSchema = z.object({
  dayOfWeek: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

function flattenNestedArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [value];
  }

  return value.flatMap(item => flattenNestedArray(item));
}

const AvailableTimesSchema = z
  .preprocess(value => {
    if (!Array.isArray(value)) {
      return value;
    }

    return flattenNestedArray(value);
  }, z.array(AvailableTimeSchema))
  .optional();

export const CreateCoachSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dateOfBirth: z.string().optional(),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  homeAddress: z.string().optional(),
  school: z.string().optional(),
  availableTimes: AvailableTimesSchema,
  employmentType: z.nativeEnum(EmploymentType).optional(),
  cvUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export type CreateCoachDto = z.infer<typeof CreateCoachSchema>;

export const UpdateCoachSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  dateOfBirth: z.string().optional(),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  homeAddress: z.string().optional(),
  school: z.string().optional(),
  availableTimes: AvailableTimesSchema,
  employmentType: z.nativeEnum(EmploymentType).optional(),
  cvUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

export type UpdateCoachDto = z.infer<typeof UpdateCoachSchema>;

// Kid Schemas
export const CreateKidSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.string().min(1, 'Gender is required'),
  birthDate: z.string().or(z.date()),
  goal: z.string().optional(),
  profilePhotoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  currentlyInSports: z.boolean(),
  medicalConditions: z.array(z.string()).default([]),
  sessionType: z.nativeEnum(SessionType),
  parentId: z.string().min(1, 'Parent ID is required'),
});

export type CreateKidDto = z.infer<typeof CreateKidSchema>;

export const UpdateKidSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  birthDate: z.string().or(z.date()).optional(),
  goal: z.string().optional(),
  profilePhotoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  currentlyInSports: z.boolean().optional(),
  medicalConditions: z.array(z.string()).optional(),
  sessionType: z.nativeEnum(SessionType).optional(),
});

export type UpdateKidDto = z.infer<typeof UpdateKidSchema>;

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

const imageContentTypesUpload = new Set(['image/jpeg', 'image/png', 'image/webp']);
const cvContentTypesUpload = new Set(['application/pdf']);

const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_CV_BYTES = 10 * 1024 * 1024;

export const UploadPresignSchema = z
  .object({
    kind: z.nativeEnum(UploadKind),
    entityId: z
      .string()
      .min(1)
      .regex(OBJECT_ID_REGEX, 'Invalid id'),
    contentType: z.string().min(1),
    size: z.number().int().positive(),
    originalName: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.kind === UploadKind.KID_AVATAR ||
      data.kind === UploadKind.PARENT_AVATAR ||
      data.kind === UploadKind.COACH_PHOTO
    ) {
      if (!imageContentTypesUpload.has(data.contentType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Allowed image types: JPEG, PNG, WebP',
          path: ['contentType'],
        });
      }
      if (data.size > MAX_UPLOAD_IMAGE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Image must be 5MB or smaller',
          path: ['size'],
        });
      }
    }
    if (data.kind === UploadKind.COACH_CV) {
      if (!cvContentTypesUpload.has(data.contentType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CV must be a PDF',
          path: ['contentType'],
        });
      }
      if (data.size > MAX_UPLOAD_CV_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CV must be 10MB or smaller',
          path: ['size'],
        });
      }
    }
  });

export type UploadPresignDto = z.infer<typeof UploadPresignSchema>;

export const UploadFinalizeSchema = z.object({
  kind: z.nativeEnum(UploadKind),
  entityId: z
    .string()
    .min(1)
    .regex(OBJECT_ID_REGEX, 'Invalid id'),
  objectKey: z.string().min(1).max(1024),
  /** Optional; if sent, must match the server-computed public URL for objectKey. */
  publicUrl: z.string().url().optional(),
});

export type UploadFinalizeDto = z.infer<typeof UploadFinalizeSchema>;

export const UploadDeleteSchema = z.object({
  kind: z.nativeEnum(UploadKind),
  entityId: z
    .string()
    .min(1)
    .regex(OBJECT_ID_REGEX, 'Invalid id'),
  publicUrl: z.string().url(),
});

export type UploadDeleteDto = z.infer<typeof UploadDeleteSchema>;

// Session Schemas
export const CreateSessionSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),

    type: z.nativeEnum(SessionType),

    coachId: z.string().min(1, 'Coach ID is required'),

    locationId: z.string().min(1, 'Location ID is required'),

    dateTime: z
      .string()
      .or(z.date())
      .refine(val => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      }, 'Invalid date & time'),

    duration: z
      .number()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Max duration is 480 minutes'),

    capacity: z.number().min(1).optional(),

    kids: z.array(z.string()).default([]),

    kidId: z.string().optional(),

    isFreeSession: z.boolean().default(false),

    isExtraSession: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // 👇 INDIVIDUAL session must have kids
    if (data.type === SessionType.INDIVIDUAL) {
      if (!data.kids || data.kids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['kids'],
          message: 'Select at least one kid',
        });
      }
    }

    // 👇 GROUP session must have capacity
    if (data.type === SessionType.GROUP) {
      if (!data.capacity || data.capacity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['capacity'],
          message: 'Capacity is required for group sessions',
        });
      }
    }
  });

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;

export const RecurrenceConfigSchema = z
  .object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    interval: z.number().int().min(1).max(12).default(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    endDate: z.string().or(z.date()).optional(),
    occurrences: z.number().int().min(1).max(52).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.frequency === 'WEEKLY' &&
      (!Array.isArray(data.daysOfWeek) || data.daysOfWeek.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one weekday for weekly recurrence',
        path: ['daysOfWeek'],
      });
    }

    if (!data.endDate && !data.occurrences) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide an end date or number of occurrences',
        path: ['endDate'],
      });
    }
  });

export const CreateRecurringSessionSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.nativeEnum(SessionType),
    coachId: z.string().min(1, 'Coach ID is required'),
    locationId: z.string().min(1, 'Location ID is required'),
    startDate: z.string().or(z.date()),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
    kids: z.array(z.string()).optional(),
    kidId: z.string().optional(),
    isFreeSession: z.boolean().default(false),
    isExtraSession: z.boolean().default(false),
    recurrence: RecurrenceConfigSchema,
  })
  .refine(
    data => {
      if (data.type === SessionType.GROUP) return true;
      return Array.isArray(data.kids) && data.kids.length >= 1;
    },
    {
      message: 'Individual sessions require at least one kid',
      path: ['kids'],
    }
  );

export type CreateRecurringSessionDto = z.infer<typeof CreateRecurringSessionSchema>;

export const UpdateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  coachId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  dateTime: z.string().or(z.date()).optional(),
  duration: z.number().min(1).optional(),
  capacity: z.number().min(1).optional(),
  kids: z.array(z.string()).optional(),
  kidId: z.string().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  isFreeSession: z.boolean().optional(),
  isExtraSession: z.boolean().optional(),
});

export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;

// Free Session Request Schema
export const CreateFreeSessionRequestSchema = z.object({
  parentName: personNameField({
    fieldLabel: 'your full name',
    requireFullName: true,
  }),
  phone: phoneField('your phone number'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  kidName: personNameField({ fieldLabel: "your child's name" }),
  sessionType: z.nativeEnum(SessionType),
  selectedSessionId: z.string().min(1, 'Select an available session.').optional(),
  preferredDateTime: z.string().or(z.date()),
  locationId: z.string().min(1, 'Location ID is required'),
});

export type CreateFreeSessionRequestDto = z.infer<typeof CreateFreeSessionRequestSchema>;

// Reschedule Request Schema
export const CreateRescheduleRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  newDateTime: z.string().or(z.date()),
  reason: z.string().min(1, 'Reason is required'),
});

export type CreateRescheduleRequestDto = z.infer<typeof CreateRescheduleRequestSchema>;

// Extra Session Request Schema (parentId optional when caller is PARENT - derived from token;
// coachId optional for parent requests — admin assigns coach before approval)
export const CreateExtraSessionRequestSchema = z.object({
  parentId: z.string().min(1, 'Parent ID is required').optional(),
  kidId: z.string().min(1, 'Kid ID is required'),
  coachId: z
    .string()
    .optional()
    .transform(val => (val && val.trim().length > 0 ? val.trim() : undefined)),
  sessionType: z.nativeEnum(SessionType),
  locationId: z.string().min(1, 'Location ID is required'),
  preferredDateTime: z.string().or(z.date()),
});

export type CreateExtraSessionRequestDto = z.infer<typeof CreateExtraSessionRequestSchema>;

// Invoice Schemas
const CreateInvoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.preprocess(
    value => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'number' && Number.isNaN(value)) {
        return undefined;
      }
      return value;
    },
    z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount is required',
      })
      .min(0, 'Amount cannot be negative')
  ),
});

export const CreateInvoiceSchema = z
  .object({
    type: z.nativeEnum(InvoiceType),
    parentId: z.string().optional(),
    coachId: z.string().optional(),
    /** Stored on the invoice as `exportFields.kidName` for PDFs (parent invoices). */
    kidName: z.string().max(200, 'Kid name must be 200 characters or less').optional(),
    items: z.array(CreateInvoiceItemSchema).min(1, 'Add at least one line item'),
    dueDate: z
      .string()
      .min(1, 'Due date is required')
      .refine(value => !Number.isNaN(new Date(value).getTime()), 'Enter a valid due date'),
  })
  .superRefine((data, ctx) => {
    if (data.type === InvoiceType.PARENT_INVOICE) {
      if (!data.parentId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parent is required',
          path: ['parentId'],
        });
      } else if (!OBJECT_ID_REGEX.test(data.parentId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid parent',
          path: ['parentId'],
        });
      }
    }

    if (data.type === InvoiceType.COACH_PAYOUT) {
      if (!data.coachId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Coach is required',
          path: ['coachId'],
        });
      } else if (!OBJECT_ID_REGEX.test(data.coachId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid coach',
          path: ['coachId'],
        });
      }
    }
  });

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoicePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
  paidAt: z.string().or(z.date()).optional(),
});

export type UpdateInvoicePaymentStatusDto = z.infer<typeof UpdateInvoicePaymentStatusSchema>;

// Location Schemas
export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  placeUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export type CreateLocationDto = z.infer<typeof CreateLocationSchema>;

export const UpdateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  placeUrl: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>;

// Banner Schemas
export const CreateBannerSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  active: z.boolean().default(true),
  order: z.number().min(0),
  targetAudience: z.nativeEnum(BannerTargetAudience),
});

export type CreateBannerDto = z.infer<typeof CreateBannerSchema>;

export const UpdateBannerSchema = z.object({
  imageUrl: z.string().url().optional(),
  active: z.boolean().optional(),
  order: z.number().min(0).optional(),
  targetAudience: z.nativeEnum(BannerTargetAudience).optional(),
});

export type UpdateBannerDto = z.infer<typeof UpdateBannerSchema>;

export const ReorderBannersSchema = z.object({
  bannerIds: z.array(z.string()).min(1),
});

export type ReorderBannersDto = z.infer<typeof ReorderBannersSchema>;

// Testimonial Schemas
export const CreateTestimonialSchema = z.object({
  authorName: z.string().min(1, 'Author name is required'),
  content: z.string().min(1, 'Content is required'),
  childName: z.string().optional(),
  childAge: z.coerce.number().min(0).max(18).optional(),
  membershipDuration: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).default(5),
  order: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateTestimonialDto = z.infer<typeof CreateTestimonialSchema>;

export const UpdateTestimonialSchema = z.object({
  authorName: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  childName: z.string().optional(),
  childAge: z.coerce.number().min(0).max(18).optional(),
  membershipDuration: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  order: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTestimonialDto = z.infer<typeof UpdateTestimonialSchema>;

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;

// Quiz Schemas
export const QuizQuestionSchema = z
  .object({
    question: z.string().min(1, 'Question is required'),
    type: z.nativeEnum(QuestionType),
    options: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    points: z.number().min(0).optional(),
  })
  .refine(
    data => {
      if (data.type === QuestionType.MULTIPLE_CHOICE) {
        return (
          data.options !== undefined &&
          data.options.length >= 2 &&
          data.options.includes(data.correctAnswer)
        );
      }
      return true;
    },
    {
      message:
        'Multiple choice questions must have at least 2 options and the correct answer must be one of them',
      path: ['options'],
    }
  )
  .refine(
    data => {
      if (data.type === QuestionType.TRUE_FALSE) {
        return data.correctAnswer === 'True' || data.correctAnswer === 'False';
      }
      return true;
    },
    {
      message: 'True/False questions must have correct answer as "True" or "False"',
      path: ['correctAnswer'],
    }
  );

export type QuizQuestionDto = z.infer<typeof QuizQuestionSchema>;

export const CreateQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema).min(1, 'At least one question is required'),
  targetAudience: z.nativeEnum(BannerTargetAudience),
  passingScore: z.number().min(0).max(100).optional(),
});

export type CreateQuizDto = z.infer<typeof CreateQuizSchema>;

export const UpdateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema).min(1).optional(),
  targetAudience: z.nativeEnum(BannerTargetAudience).optional(),
  isActive: z.boolean().optional(),
  passingScore: z.number().min(0).max(100).optional(),
});

export type UpdateQuizDto = z.infer<typeof UpdateQuizSchema>;

// Report Schemas
export const CreateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  filters: z.record(z.unknown()).optional(),
});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;

export const GenerateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  filters: z.record(z.unknown()).optional(),
});

export type GenerateReportDto = z.infer<typeof GenerateReportSchema>;
