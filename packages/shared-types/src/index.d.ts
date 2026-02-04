export declare enum UserRole {
    ADMIN = "ADMIN",
    COACH = "COACH",
    PARENT = "PARENT"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED"
}
export declare enum SessionType {
    INDIVIDUAL = "INDIVIDUAL",
    GROUP = "GROUP"
}
export declare enum SessionStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export declare enum RequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    SELECTED = "SELECTED",
    NOT_SELECTED = "NOT_SELECTED",
    COMPLETED = "COMPLETED"
}
export declare enum InvoiceType {
    PARENT_INVOICE = "PARENT_INVOICE",
    COACH_PAYOUT = "COACH_PAYOUT"
}
export declare enum InvoiceStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare enum BannerTargetAudience {
    PARENT = "PARENT",
    COACH = "COACH",
    ALL = "ALL"
}
export interface User {
    id: string;
    role: UserRole;
    email: string;
    phone: string;
    passwordHash: string;
    status: UserStatus;
    parentProfile?: ParentProfile;
    coachProfile?: CoachProfile;
    createdAt: Date;
    updatedAt: Date;
}
export interface ParentProfile {
    name: string;
    location?: string;
}
export interface CoachProfile {
    name: string;
}
export interface Kid {
    id: string;
    parentId: string;
    name: string;
    gender: string;
    birthDate: Date;
    goal?: string;
    currentlyInSports: boolean;
    medicalConditions: string[];
    sessionType: SessionType;
    achievements?: string[];
    milestones?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Session {
    id: string;
    type: SessionType;
    coachId: string;
    locationId: string;
    dateTime: Date;
    duration: number;
    capacity: number;
    kids?: string[];
    kidId?: string;
    status: SessionStatus;
    isFreeSession: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface FreeSessionRequest {
    id: string;
    parentName: string;
    phone: string;
    email: string;
    kidName: string;
    sessionType: SessionType;
    selectedSessionId?: string;
    status: RequestStatus;
    createdAt: Date;
}
export interface RescheduleRequest {
    id: string;
    sessionId: string;
    requestedBy: string;
    newDateTime: Date;
    reason: string;
    status: RequestStatus;
    createdAt: Date;
    processedAt?: Date;
}
export interface ExtraSessionRequest {
    id: string;
    parentId: string;
    kidId: string;
    coachId: string;
    sessionType: SessionType;
    locationId: string;
    preferredDateTime: Date;
    status: RequestStatus;
    createdAt: Date;
}
export interface Invoice {
    id: string;
    type: InvoiceType;
    parentId?: string;
    coachId?: string;
    items: InvoiceItem[];
    totalAmount: number;
    status: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date;
    exportFields?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface InvoiceItem {
    description: string;
    amount: number;
}
export interface Location {
    id: string;
    name: string;
    address: string;
    geo?: {
        lat: number;
        lng: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Banner {
    id: string;
    imageUrl: string;
    active: boolean;
    order: number;
    targetAudience: BannerTargetAudience;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuditLog {
    id: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
