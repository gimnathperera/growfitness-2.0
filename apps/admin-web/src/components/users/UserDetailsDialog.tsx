import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@grow-fitness/shared-types';
import { formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
  const isParent = !!user.parentProfile;
  const isCoach = !!user.coachProfile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View user information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p className="text-sm font-medium">
              {isParent ? user.parentProfile?.name : isCoach ? user.coachProfile?.name : 'N/A'}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-sm">{user.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
            <p className="text-sm">{user.phone}</p>
          </div>

          {isParent && user.parentProfile?.location && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <p className="text-sm">{user.parentProfile.location}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
            <p className="text-sm">{user.role}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <StatusBadge status={user.status} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
            <p className="text-sm">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
