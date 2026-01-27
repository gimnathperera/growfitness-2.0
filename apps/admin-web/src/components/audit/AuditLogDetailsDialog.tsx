import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuditLog } from '@grow-fitness/shared-types';
import { formatDateTime } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

interface AuditLogDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog;
}

export function AuditLogDetailsDialog({ open, onOpenChange, log }: AuditLogDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>View audit log information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          

          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Action</h3>
            <p className="text-sm font-medium">{log.action}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Entity Type</h3>
            <p className="text-sm">{log.entityType}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Entity ID</h3>
            <p className="text-sm">{log.entityId}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Actor</h3>
            <p className="text-sm">
              {(() => {
                const actorId = log.actorId as any;
                if (!actorId) return 'N/A';
                if (typeof actorId === 'string') return actorId;
                if (typeof actorId === 'object') {
                  if (actorId.email) return actorId.email;
                  if (actorId._id) return actorId._id.toString();
                  if (actorId.id) return actorId.id;
                }
                return 'N/A';
              })()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
            <p className="text-sm">{formatDateTime(log.timestamp)}</p>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
