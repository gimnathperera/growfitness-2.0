"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = exports.UpdateTestimonialSchema = exports.CreateTestimonialSchema = exports.ReorderBannersSchema = exports.UpdateBannerSchema = exports.CreateBannerSchema = exports.UpdateLocationSchema = exports.CreateLocationSchema = exports.UpdateInvoicePaymentStatusSchema = exports.CreateInvoiceSchema = exports.CreateExtraSessionRequestSchema = exports.CreateRescheduleRequestSchema = exports.CreateFreeSessionRequestSchema = exports.UpdateSessionSchema = exports.CreateSessionSchema = exports.UpdateKidSchema = exports.CreateKidSchema = exports.UpdateCoachSchema = exports.CreateCoachSchema = exports.UpdateParentSchema = exports.CreateParentSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
const shared_types_1 = require("@grow-fitness/shared-types");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.CreateParentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    location: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    kids: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Kid name is required'),
        gender: zod_1.z.string().min(1, 'Gender is required'),
        birthDate: zod_1.z.string().or(zod_1.z.date()),
        goal: zod_1.z.string().optional(),
        currentlyInSports: zod_1.z.boolean(),
        medicalConditions: zod_1.z.array(zod_1.z.string()).default([]),
        sessionType: zod_1.z.nativeEnum(shared_types_1.SessionType),
    }))
        .min(1, 'At least one kid is required'),
});
exports.UpdateParentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(1).optional(),
    location: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'DELETED']).optional(),
});
exports.CreateCoachSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.UpdateCoachSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(1).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
exports.CreateKidSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    gender: zod_1.z.string().min(1, 'Gender is required'),
    birthDate: zod_1.z.string().or(zod_1.z.date()),
    goal: zod_1.z.string().optional(),
    currentlyInSports: zod_1.z.boolean(),
    medicalConditions: zod_1.z.array(zod_1.z.string()).default([]),
    sessionType: zod_1.z.nativeEnum(shared_types_1.SessionType),
    parentId: zod_1.z.string().min(1, 'Parent ID is required'),
});
exports.UpdateKidSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    gender: zod_1.z.string().min(1).optional(),
    birthDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    goal: zod_1.z.string().optional(),
    currentlyInSports: zod_1.z.boolean().optional(),
    medicalConditions: zod_1.z.array(zod_1.z.string()).optional(),
    sessionType: zod_1.z.nativeEnum(shared_types_1.SessionType).optional(),
});
exports.CreateSessionSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(shared_types_1.SessionType),
    coachId: zod_1.z.string().min(1, 'Coach ID is required'),
    locationId: zod_1.z.string().min(1, 'Location ID is required'),
    dateTime: zod_1.z.string().or(zod_1.z.date()),
    duration: zod_1.z.number().min(1, 'Duration must be at least 1 minute'),
    capacity: zod_1.z.number().min(1, 'Capacity must be at least 1').optional(),
    kids: zod_1.z.array(zod_1.z.string()).optional(),
    kidId: zod_1.z.string().optional(),
    isFreeSession: zod_1.z.boolean().default(false),
});
exports.UpdateSessionSchema = zod_1.z.object({
    coachId: zod_1.z.string().min(1).optional(),
    locationId: zod_1.z.string().min(1).optional(),
    dateTime: zod_1.z.string().or(zod_1.z.date()).optional(),
    duration: zod_1.z.number().min(1).optional(),
    capacity: zod_1.z.number().min(1).optional(),
    kids: zod_1.z.array(zod_1.z.string()).optional(),
    kidId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(shared_types_1.SessionStatus).optional(),
});
exports.CreateFreeSessionRequestSchema = zod_1.z.object({
    parentName: zod_1.z.string().min(1, 'Parent name is required'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    email: zod_1.z.string().email('Invalid email address'),
    kidName: zod_1.z.string().min(1, 'Kid name is required'),
    sessionType: zod_1.z.nativeEnum(shared_types_1.SessionType),
    selectedSessionId: zod_1.z.string().min(1, 'Session ID is required'),
});
exports.CreateRescheduleRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, 'Session ID is required'),
    newDateTime: zod_1.z.string().or(zod_1.z.date()),
    reason: zod_1.z.string().min(1, 'Reason is required'),
});
exports.CreateExtraSessionRequestSchema = zod_1.z.object({
    parentId: zod_1.z.string().min(1, 'Parent ID is required'),
    kidId: zod_1.z.string().min(1, 'Kid ID is required'),
    coachId: zod_1.z.string().min(1, 'Coach ID is required'),
    sessionType: zod_1.z.nativeEnum(shared_types_1.SessionType),
    locationId: zod_1.z.string().min(1, 'Location ID is required'),
    preferredDateTime: zod_1.z.string().or(zod_1.z.date()),
});
exports.CreateInvoiceSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(shared_types_1.InvoiceType),
    parentId: zod_1.z.string().optional(),
    coachId: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string().min(1),
        amount: zod_1.z.number().min(0),
    })),
    dueDate: zod_1.z.string().or(zod_1.z.date()),
});
exports.UpdateInvoicePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE']),
    paidAt: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.CreateLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    geo: zod_1.z
        .object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    })
        .optional(),
});
exports.UpdateLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    address: zod_1.z.string().min(1).optional(),
    geo: zod_1.z
        .object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    })
        .optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.CreateBannerSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().url('Invalid image URL'),
    active: zod_1.z.boolean().default(true),
    order: zod_1.z.number().min(0),
    targetAudience: zod_1.z.nativeEnum(shared_types_1.BannerTargetAudience),
});
exports.UpdateBannerSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().url().optional(),
    active: zod_1.z.boolean().optional(),
    order: zod_1.z.number().min(0).optional(),
    targetAudience: zod_1.z.nativeEnum(shared_types_1.BannerTargetAudience).optional(),
});
exports.ReorderBannersSchema = zod_1.z.object({
    bannerIds: zod_1.z.array(zod_1.z.string()).min(1),
});
exports.CreateTestimonialSchema = zod_1.z.object({
    authorName: zod_1.z.string().min(1, 'Author name is required'),
    content: zod_1.z.string().min(1, 'Content is required'),
    childName: zod_1.z.string().optional(),
    childAge: zod_1.z.coerce.number().min(0).max(18).optional(),
    membershipDuration: zod_1.z.string().optional(),
    rating: zod_1.z.coerce.number().min(1).max(5).default(5),
    order: zod_1.z.coerce.number().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.UpdateTestimonialSchema = zod_1.z.object({
    authorName: zod_1.z.string().min(1).optional(),
    content: zod_1.z.string().min(1).optional(),
    childName: zod_1.z.string().optional(),
    childAge: zod_1.z.coerce.number().min(0).max(18).optional(),
    membershipDuration: zod_1.z.string().optional(),
    rating: zod_1.z.coerce.number().min(1).max(5).optional(),
    order: zod_1.z.coerce.number().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
//# sourceMappingURL=index.js.map
