import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Session } from '@grow-fitness/shared-types';
import { formatDateTime, formatSessionType } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';

interface SessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
}

export function SessionDetailsDialog({ open, onOpenChange, session }: SessionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>View session information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
            <p className="text-sm font-medium">{formatDateTime(session.dateTime)}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
            <p className="text-sm">{formatSessionType(session.type)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
            <p className="text-sm">{session.duration} minutes</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <StatusBadge status={session.status} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Free Session</h3>
            <p className="text-sm">{session.isFreeSession ? 'Yes' : 'No'}</p>
          </div>

          {session.capacity && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
              <p className="text-sm">{session.capacity}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
