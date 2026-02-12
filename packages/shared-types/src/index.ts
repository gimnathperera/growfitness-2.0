// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  PARENT = 'PARENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  SELECTED = 'SELECTED',
  NOT_SELECTED = 'NOT_SELECTED',
  COMPLETED = 'COMPLETED',
}

export enum InvoiceType {
  PARENT_INVOICE = 'PARENT_INVOICE',
  COACH_PAYOUT = 'COACH_PAYOUT',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum BannerTargetAudience {
  PARENT = 'PARENT',
  COACH = 'COACH',
  ALL = 'ALL',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export enum ReportType {
  ATTENDANCE = 'ATTENDANCE',
  PERFORMANCE = 'PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  SESSION_SUMMARY = 'SESSION_SUMMARY',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

// Types
export interface User {
  id: string;
  role: UserRole;
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
  parentProfile?: ParentProfile;
  coachProfile?: CoachProfile;
  sessionTypes?: SessionType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentProfile {
  name: string;
  location?: string;
}

export interface CoachProfile {
  name: string;
  // Add more coach-specific fields as needed
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

/** Populated coach reference (when coachId is expanded) */
export interface SessionCoachRef {
  id: string;
  email: string;
  coachProfile?: CoachProfile;
}

/** Populated location reference (when locationId is expanded) */
export interface SessionLocationRef {
  id: string;
  name: string;
  address: string;
  geo?: { lat: number; lng: number };
  isActive: boolean;
}

export interface Session {
  id: string;
  type: SessionType;
  coachId: string;
  locationId: string;
  /** Populated when API expands coachId */
  coach?: SessionCoachRef;
  /** Populated when API expands locationId */
  location?: SessionLocationRef;
  dateTime: Date;
  duration: number; // minutes
  capacity: number;
  kids?: string[]; // for group sessions
  kidId?: string; // for individual sessions
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
  preferredDateTime?: Date;
  locationId?: string;
  status: RequestStatus;
  createdAt: Date;
}

export interface RescheduleRequest {
  id: string;
  sessionId: string;
  requestedBy: string; // User ID
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

export interface UserRegistrationRequest {
  id: string;
  parentId: string;
  status: RequestStatus;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

/** Populated parent reference (when parentId is expanded) */
export interface InvoiceParentRef {
  id: string;
  email: string;
  parentProfile?: ParentProfile;
}

/** Populated coach reference (when coachId is expanded) */
export interface InvoiceCoachRef {
  id: string;
  email: string;
  coachProfile?: CoachProfile;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  parentId?: string;
  coachId?: string;
  /** Populated when API expands parentId */
  parent?: InvoiceParentRef;
  /** Populated when API expands coachId */
  coach?: InvoiceCoachRef;
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

export interface Testimonial {
  id: string;
  authorName: string;
  content: string;
  childName?: string;
  childAge?: number;
  membershipDuration?: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
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

export interface QuizQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  targetAudience: BannerTargetAudience;
  isActive: boolean;
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  status: ReportStatus;
  startDate?: Date;
  endDate?: Date;
  filters?: Record<string, unknown>;
  data?: Record<string, unknown>;
  fileUrl?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination
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
