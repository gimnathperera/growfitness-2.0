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

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  // User Status
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  DELETED: 'destructive',
  // Session Status
  SCHEDULED: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'default', // Used by both SessionStatus and RequestStatus
  // Request Status
  PENDING: 'secondary',
  APPROVED: 'default',
  DENIED: 'destructive',
  SELECTED: 'default',
  NOT_SELECTED: 'outline',
  // Invoice Status
  PAID: 'default',
  OVERDUE: 'destructive',
  // Report Status
  GENERATED: 'default',
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
