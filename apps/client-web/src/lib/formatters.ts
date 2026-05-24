import { format, formatDistanceToNow } from 'date-fns';
import {
  UserStatus,
  SessionStatus,
  RequestStatus,
  InvoiceStatus,
  InvoiceType,
  SessionType,
  BannerTargetAudience,
} from '@grow-fitness/shared-types';

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm');
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rs 0.00';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
}

export function formatUserStatus(status: UserStatus): string {
  const statusMap: Record<UserStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DELETED: 'Deleted',
  };
  return statusMap[status] || status;
}

export function formatSessionStatus(status: SessionStatus): string {
  const statusMap: Record<SessionStatus, string> = {
    SCHEDULED: 'Scheduled',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  };
  return statusMap[status] || status;
}

export function formatRequestStatus(status: RequestStatus): string {
  const statusMap: Record<RequestStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    DENIED: 'Denied',
    SELECTED: 'Selected',
    NOT_SELECTED: 'Not Selected',
    COMPLETED: 'Completed',
  };
  return statusMap[status] || status;
}

export function formatInvoiceStatus(status: InvoiceStatus): string {
  const statusMap: Record<InvoiceStatus, string> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
  };
  return statusMap[status] || status;
}

export function formatInvoiceType(type: InvoiceType): string {
  const typeMap: Record<InvoiceType, string> = {
    PARENT_INVOICE: 'Parent Invoice',
    COACH_PAYOUT: 'Coach Payout',
  };
  return typeMap[type] || type;
}

/** Short UI label for session **kind** (`Session.type` / kid enrolment enum). Keeps API values as INDIVIDUAL/GROUP/BOTH. */
export function formatSessionType(
  type: SessionType | string | undefined | null
): string {
  if (type === undefined || type === null || type === '') return '—';
  const raw = String(type);
  const typeMap: Record<string, string> = {
    INDIVIDUAL: 'PRIVATE',
    GROUP: 'GROUP',
    BOTH: 'BOTH',
  };
  return typeMap[raw] ?? raw;
}

/** Heading or card title (“Private Session”); avoids chaining `formatSessionType` + “ Session”. */
export function formatSessionKindHeading(type: SessionType | string): string {
  switch (type as SessionType) {
    case SessionType.INDIVIDUAL:
      return 'Private Session';
    case SessionType.GROUP:
      return 'Group Session';
    case SessionType.BOTH:
      return 'Group & Private Sessions';
    default:
      return 'Session';
  }
}

export function formatBannerTargetAudience(audience: BannerTargetAudience): string {
  const audienceMap: Record<BannerTargetAudience, string> = {
    PARENT: 'Parent',
    COACH: 'Coach',
    ALL: 'All',
  };
  return audienceMap[audience] || audience;
}
