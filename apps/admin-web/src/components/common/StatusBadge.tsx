import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  UserStatus,
  SessionStatus,
  RequestStatus,
  InvoiceStatus,
  ReportStatus,
} from '@grow-fitness/shared-types';

interface StatusBadgeProps {
  status: UserStatus | SessionStatus | RequestStatus | InvoiceStatus | ReportStatus;
  className?: string;
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'> = {
  // User Status
  ACTIVE: 'success',
  INACTIVE: 'info',
  DELETED: 'destructive',
  // Session Status
  SCHEDULED: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
  COMPLETED: 'success', // Used by both SessionStatus and RequestStatus
  // Request Status
  PENDING: 'warning',
  APPROVED: 'success',
  DENIED: 'destructive',
  SELECTED: 'success',
  NOT_SELECTED: 'outline',
  // Invoice Status
  PAID: 'success',
  OVERDUE: 'destructive',
  // Report Status
  GENERATED: 'success',
  FAILED: 'destructive',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || 'default';

  return (
    <Badge variant={variant} className={cn(className)}>
      {String(status).replace('_', ' ')}
    </Badge>
  );
}
