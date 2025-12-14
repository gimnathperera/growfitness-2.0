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

// Types
export interface User {
  _id: string;
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
  // Add more coach-specific fields as needed
}

export interface Kid {
  _id: string;
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
  _id: string;
  type: SessionType;
  coachId: string;
  locationId: string;
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
  _id: string;
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
  _id: string;
  sessionId: string;
  requestedBy: string; // User ID
  newDateTime: Date;
  reason: string;
  status: RequestStatus;
  createdAt: Date;
  processedAt?: Date;
}

export interface ExtraSessionRequest {
  _id: string;
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
  _id: string;
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
  _id: string;
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
  _id: string;
  imageUrl: string;
  active: boolean;
  order: number;
  targetAudience: BannerTargetAudience;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
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

