import { z } from 'zod';
import {
  SessionType,
  SessionStatus,
  InvoiceType,
  BannerTargetAudience,
  QuestionType,
  ReportType,
} from '@grow-fitness/shared-types';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// User Schemas
export const CreateParentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  location: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  kids: z
    .array(
      z.object({
        name: z.string().min(1, 'Kid name is required'),
        gender: z.string().min(1, 'Gender is required'),
        birthDate: z.string().or(z.date()),
        goal: z.string().optional(),
        currentlyInSports: z.boolean(),
        medicalConditions: z.array(z.string()).default([]),
        sessionType: z.nativeEnum(SessionType),
      })
    )
    .min(1, 'At least one kid is required'),
});

export type CreateParentDto = z.infer<typeof CreateParentSchema>;

export const UpdateParentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DELETED']).optional(),
});

export type UpdateParentDto = z.infer<typeof UpdateParentSchema>;

export const CreateCoachSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CreateCoachDto = z.infer<typeof CreateCoachSchema>;

export const UpdateCoachSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type UpdateCoachDto = z.infer<typeof UpdateCoachSchema>;

// Kid Schemas
export const CreateKidSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.string().min(1, 'Gender is required'),
  birthDate: z.string().or(z.date()),
  goal: z.string().optional(),
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
  currentlyInSports: z.boolean().optional(),
  medicalConditions: z.array(z.string()).optional(),
  sessionType: z.nativeEnum(SessionType).optional(),
});

export type UpdateKidDto = z.infer<typeof UpdateKidSchema>;

// Session Schemas
export const CreateSessionSchema = z
  .object({
    type: z.nativeEnum(SessionType),
    coachId: z.string().min(1, 'Coach ID is required'),
    locationId: z.string().min(1, 'Location ID is required'),
    dateTime: z.string().or(z.date()),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
    kids: z.array(z.string()).optional(),
    kidId: z.string().optional(),
    isFreeSession: z.boolean().default(false),
  })
  .refine(
    data => {
      if (data.type === SessionType.GROUP) {
        return data.kids && data.kids.length > 0;
      } else {
        return !!data.kidId;
      }
    },
    {
      message: 'Group sessions require kids array, individual sessions require kidId',
    }
  );

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;

export const UpdateSessionSchema = z.object({
  coachId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  dateTime: z.string().or(z.date()).optional(),
  duration: z.number().min(1).optional(),
  capacity: z.number().min(1).optional(),
  kids: z.array(z.string()).optional(),
  kidId: z.string().optional(),
  status: z.nativeEnum(SessionStatus).optional(),
  isFreeSession: z.boolean().optional(),
});

export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;

// Free Session Request Schema
export const CreateFreeSessionRequestSchema = z.object({
  parentName: z.string().min(1, 'Parent name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  kidName: z.string().min(1, 'Kid name is required'),
  sessionType: z.nativeEnum(SessionType),
  selectedSessionId: z.string().optional(),
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

// Extra Session Request Schema
export const CreateExtraSessionRequestSchema = z.object({
  parentId: z.string().min(1, 'Parent ID is required'),
  kidId: z.string().min(1, 'Kid ID is required'),
  coachId: z.string().min(1, 'Coach ID is required'),
  sessionType: z.nativeEnum(SessionType),
  locationId: z.string().min(1, 'Location ID is required'),
  preferredDateTime: z.string().or(z.date()),
});

export type CreateExtraSessionRequestDto = z.infer<typeof CreateExtraSessionRequestSchema>;

// Invoice Schemas
export const CreateInvoiceSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  parentId: z.string().optional(),
  coachId: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      amount: z.number().min(0),
    })
  ),
  dueDate: z.string().or(z.date()),
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