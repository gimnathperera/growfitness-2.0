import { z } from 'zod';
import { SessionType, InvoiceType, BannerTargetAudience } from '@grow-fitness/shared-types';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const CreateParentSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    kids: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        gender: z.ZodString;
        birthDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        goal: z.ZodOptional<z.ZodString>;
        currentlyInSports: z.ZodBoolean;
        medicalConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sessionType: z.ZodNativeEnum<typeof SessionType>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        gender: string;
        birthDate: string | Date;
        currentlyInSports: boolean;
        medicalConditions: string[];
        sessionType: SessionType;
        goal?: string | undefined;
    }, {
        name: string;
        gender: string;
        birthDate: string | Date;
        currentlyInSports: boolean;
        sessionType: SessionType;
        goal?: string | undefined;
        medicalConditions?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    password: string;
    kids: {
        name: string;
        gender: string;
        birthDate: string | Date;
        currentlyInSports: boolean;
        medicalConditions: string[];
        sessionType: SessionType;
        goal?: string | undefined;
    }[];
    location?: string | undefined;
}, {
    name: string;
    email: string;
    phone: string;
    password: string;
    kids: {
        name: string;
        gender: string;
        birthDate: string | Date;
        currentlyInSports: boolean;
        sessionType: SessionType;
        goal?: string | undefined;
        medicalConditions?: string[] | undefined;
    }[];
    location?: string | undefined;
}>;
export type CreateParentDto = z.infer<typeof CreateParentSchema>;
export declare const UpdateParentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "DELETED"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "DELETED" | undefined;
    location?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "DELETED" | undefined;
    location?: string | undefined;
}>;
export type UpdateParentDto = z.infer<typeof UpdateParentSchema>;
export declare const CreateCoachSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    password: string;
}, {
    name: string;
    email: string;
    phone: string;
    password: string;
}>;
export type CreateCoachDto = z.infer<typeof CreateCoachSchema>;
export declare const UpdateCoachSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
}>;
export type UpdateCoachDto = z.infer<typeof UpdateCoachSchema>;
export declare const CreateKidSchema: z.ZodObject<{
    name: z.ZodString;
    gender: z.ZodString;
    birthDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    goal: z.ZodOptional<z.ZodString>;
    currentlyInSports: z.ZodBoolean;
    medicalConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sessionType: z.ZodNativeEnum<typeof SessionType>;
    parentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    gender: string;
    birthDate: string | Date;
    currentlyInSports: boolean;
    medicalConditions: string[];
    sessionType: SessionType;
    parentId: string;
    goal?: string | undefined;
}, {
    name: string;
    gender: string;
    birthDate: string | Date;
    currentlyInSports: boolean;
    sessionType: SessionType;
    parentId: string;
    goal?: string | undefined;
    medicalConditions?: string[] | undefined;
}>;
export type CreateKidDto = z.infer<typeof CreateKidSchema>;
export declare const UpdateKidSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    goal: z.ZodOptional<z.ZodString>;
    currentlyInSports: z.ZodOptional<z.ZodBoolean>;
    medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sessionType: z.ZodOptional<z.ZodNativeEnum<typeof SessionType>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    gender?: string | undefined;
    birthDate?: string | Date | undefined;
    goal?: string | undefined;
    currentlyInSports?: boolean | undefined;
    medicalConditions?: string[] | undefined;
    sessionType?: SessionType | undefined;
}, {
    name?: string | undefined;
    gender?: string | undefined;
    birthDate?: string | Date | undefined;
    goal?: string | undefined;
    currentlyInSports?: boolean | undefined;
    medicalConditions?: string[] | undefined;
    sessionType?: SessionType | undefined;
}>;
export type UpdateKidDto = z.infer<typeof UpdateKidSchema>;
export declare const CreateSessionSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof SessionType>;
    coachId: z.ZodString;
    locationId: z.ZodString;
    dateTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    duration: z.ZodNumber;
    capacity: z.ZodOptional<z.ZodNumber>;
    kids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    kidId: z.ZodOptional<z.ZodString>;
    isFreeSession: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: SessionType;
    coachId: string;
    locationId: string;
    dateTime: string | Date;
    duration: number;
    isFreeSession: boolean;
    kids?: string[] | undefined;
    capacity?: number | undefined;
    kidId?: string | undefined;
}, {
    type: SessionType;
    coachId: string;
    locationId: string;
    dateTime: string | Date;
    duration: number;
    kids?: string[] | undefined;
    capacity?: number | undefined;
    kidId?: string | undefined;
    isFreeSession?: boolean | undefined;
}>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export declare const UpdateSessionSchema: z.ZodObject<{
    coachId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    dateTime: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    capacity: z.ZodOptional<z.ZodNumber>;
    kids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    kidId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | undefined;
    kids?: string[] | undefined;
    coachId?: string | undefined;
    locationId?: string | undefined;
    dateTime?: string | Date | undefined;
    duration?: number | undefined;
    capacity?: number | undefined;
    kidId?: string | undefined;
}, {
    status?: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | undefined;
    kids?: string[] | undefined;
    coachId?: string | undefined;
    locationId?: string | undefined;
    dateTime?: string | Date | undefined;
    duration?: number | undefined;
    capacity?: number | undefined;
    kidId?: string | undefined;
}>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export declare const CreateFreeSessionRequestSchema: z.ZodObject<{
    parentName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    kidName: z.ZodString;
    sessionType: z.ZodNativeEnum<typeof SessionType>;
    selectedSessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    phone: string;
    sessionType: SessionType;
    parentName: string;
    kidName: string;
    selectedSessionId: string;
}, {
    email: string;
    phone: string;
    sessionType: SessionType;
    parentName: string;
    kidName: string;
    selectedSessionId: string;
}>;
export type CreateFreeSessionRequestDto = z.infer<typeof CreateFreeSessionRequestSchema>;
export declare const CreateRescheduleRequestSchema: z.ZodObject<{
    sessionId: z.ZodString;
    newDateTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    newDateTime: string | Date;
    reason: string;
}, {
    sessionId: string;
    newDateTime: string | Date;
    reason: string;
}>;
export type CreateRescheduleRequestDto = z.infer<typeof CreateRescheduleRequestSchema>;
export declare const CreateExtraSessionRequestSchema: z.ZodObject<{
    parentId: z.ZodString;
    kidId: z.ZodString;
    coachId: z.ZodString;
    sessionType: z.ZodNativeEnum<typeof SessionType>;
    locationId: z.ZodString;
    preferredDateTime: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    sessionType: SessionType;
    parentId: string;
    coachId: string;
    locationId: string;
    kidId: string;
    preferredDateTime: string | Date;
}, {
    sessionType: SessionType;
    parentId: string;
    coachId: string;
    locationId: string;
    kidId: string;
    preferredDateTime: string | Date;
}>;
export type CreateExtraSessionRequestDto = z.infer<typeof CreateExtraSessionRequestSchema>;
export declare const CreateInvoiceSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof InvoiceType>;
    parentId: z.ZodOptional<z.ZodString>;
    coachId: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        amount: number;
    }, {
        description: string;
        amount: number;
    }>, "many">;
    dueDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    type: InvoiceType;
    items: {
        description: string;
        amount: number;
    }[];
    dueDate: string | Date;
    parentId?: string | undefined;
    coachId?: string | undefined;
}, {
    type: InvoiceType;
    items: {
        description: string;
        amount: number;
    }[];
    dueDate: string | Date;
    parentId?: string | undefined;
    coachId?: string | undefined;
}>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export declare const UpdateInvoicePaymentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "PAID", "OVERDUE"]>;
    paidAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "PAID" | "OVERDUE";
    paidAt?: string | Date | undefined;
}, {
    status: "PENDING" | "PAID" | "OVERDUE";
    paidAt?: string | Date | undefined;
}>;
export type UpdateInvoicePaymentStatusDto = z.infer<typeof UpdateInvoicePaymentStatusSchema>;
export declare const CreateLocationSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    geo: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: string;
    geo?: {
        lat: number;
        lng: number;
    } | undefined;
}, {
    name: string;
    address: string;
    geo?: {
        lat: number;
        lng: number;
    } | undefined;
}>;
export type CreateLocationDto = z.infer<typeof CreateLocationSchema>;
export declare const UpdateLocationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    geo: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    address?: string | undefined;
    geo?: {
        lat: number;
        lng: number;
    } | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    address?: string | undefined;
    geo?: {
        lat: number;
        lng: number;
    } | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>;
export declare const CreateBannerSchema: z.ZodObject<{
    imageUrl: z.ZodString;
    active: z.ZodDefault<z.ZodBoolean>;
    order: z.ZodNumber;
    targetAudience: z.ZodNativeEnum<typeof BannerTargetAudience>;
}, "strip", z.ZodTypeAny, {
    imageUrl: string;
    active: boolean;
    order: number;
    targetAudience: BannerTargetAudience;
}, {
    imageUrl: string;
    order: number;
    targetAudience: BannerTargetAudience;
    active?: boolean | undefined;
}>;
export type CreateBannerDto = z.infer<typeof CreateBannerSchema>;
export declare const UpdateBannerSchema: z.ZodObject<{
    imageUrl: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodNumber>;
    targetAudience: z.ZodOptional<z.ZodNativeEnum<typeof BannerTargetAudience>>;
}, "strip", z.ZodTypeAny, {
    imageUrl?: string | undefined;
    active?: boolean | undefined;
    order?: number | undefined;
    targetAudience?: BannerTargetAudience | undefined;
}, {
    imageUrl?: string | undefined;
    active?: boolean | undefined;
    order?: number | undefined;
    targetAudience?: BannerTargetAudience | undefined;
}>;
export type UpdateBannerDto = z.infer<typeof UpdateBannerSchema>;
export declare const ReorderBannersSchema: z.ZodObject<{
    bannerIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    bannerIds: string[];
}, {
    bannerIds: string[];
}>;
export type ReorderBannersDto = z.infer<typeof ReorderBannersSchema>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
