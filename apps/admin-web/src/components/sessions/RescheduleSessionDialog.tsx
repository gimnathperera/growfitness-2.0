import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/common/DateTimePicker';
import { FormField } from '@/components/common/FormField';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
import { useApiMutation, useApiQuery } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/lib/formatters';
import { useModalParams } from '@/hooks/useModalParams';
import { CalendarClock, User } from 'lucide-react';

interface RescheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session;
}

export function canAdminRescheduleSession(session: Session): boolean {
  return (
    session.status === SessionStatus.SCHEDULED || session.status === SessionStatus.CONFIRMED
  );
}

function getCoachLabel(session: Session): string {
  const coach = session.coach;
  if (coach?.coachProfile?.name) return coach.coachProfile.name;
  if (coach?.email) return coach.email;
  if (typeof session.coachId === 'object' && session.coachId !== null) {
    const c = session.coachId as { coachProfile?: { name?: string }; email?: string };
    return c.coachProfile?.name || c.email || 'N/A';
  }
  return 'N/A';
}

function SessionSummaryCard({ session }: { session: Session }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
        Current schedule
      </div>
      <dl className="grid gap-2.5 text-sm">
        <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">Session</dt>
          <dd className="font-medium text-foreground">{session.title || 'Untitled session'}</dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5 shrink-0" />
            Coach
          </dt>
          <dd className="font-medium text-foreground">{getCoachLabel(session)}</dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">When</dt>
          <dd className="font-medium text-foreground">{formatDateTime(session.dateTime)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function RescheduleSessionDialog({
  open,
  onOpenChange,
  session: sessionProp,
}: RescheduleSessionDialogProps) {
  const { toast } = useToast();
  const { entityId, closeModal } = useModalParams('sessionId');
  const [newDateTime, setNewDateTime] = useState<Date | undefined>();
  const [reason, setReason] = useState('');

  const { data: sessionFromUrl } = useApiQuery<Session>(
    ['sessions', entityId || 'no-id'],
    () => {
      if (!entityId) {
        throw new Error('Session ID is required');
      }
      return sessionsService.getSessionById(entityId);
    },
    {
      enabled: open && !sessionProp && !!entityId,
    }
  );

  const session = sessionProp || sessionFromUrl;

  useEffect(() => {
    if (!open) {
      setNewDateTime(undefined);
      setReason('');
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      closeModal();
    }
    onOpenChange(newOpen);
  };

  const rescheduleMutation = useApiMutation(
    ({ id, dateTime }: { id: string; dateTime: string }) =>
      sessionsService.updateSession(id, { dateTime }),
    {
      invalidateQueries: [['sessions']],
      onSuccess: () => {
        toast.success(
          reason.trim()
            ? `Session rescheduled. Note: ${reason.trim()}`
            : 'Session rescheduled successfully'
        );
        handleOpenChange(false);
      },
      onError: error => {
        toast.error('Failed to reschedule session', error.message);
      },
    }
  );

  if (!session) {
    return null;
  }

  const canReschedule = canAdminRescheduleSession(session);
  const currentDateTime = new Date(session.dateTime);
  const isSameDateTime =
    newDateTime !== undefined && newDateTime.getTime() === currentDateTime.getTime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canReschedule) {
      return;
    }

    if (!newDateTime) {
      toast.error('Please select a new date and time');
      return;
    }

    if (isSameDateTime) {
      toast.error('New date and time must differ from the current schedule');
      return;
    }

    rescheduleMutation.mutate({
      id: session.id,
      dateTime: newDateTime.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="border-b bg-muted/30 flex-shrink-0 pb-3">
            <DialogHeader className="space-y-1 px-6 pt-6 pr-12">
              <DialogTitle className="text-xl">Reschedule Session</DialogTitle>
              <DialogDescription className="text-sm">
                Update the session date and time. Coach and parents will be notified immediately.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            <form id="reschedule-session-form" onSubmit={handleSubmit} className="space-y-5">
              <SessionSummaryCard session={session} />

              {!canReschedule ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  Cancelled and completed sessions cannot be rescheduled.
                </p>
              ) : (
                <>
                  <FormField label="New date & time" required>
                    <DateTimePicker
                      date={newDateTime}
                      onSelect={setNewDateTime}
                      placeholder="Pick new date and time"
                      className="w-full flex-col sm:flex-row sm:items-stretch"
                    />
                  </FormField>

                  <FormField label="Reason (optional)" htmlFor="rescheduleReason">
                    <Textarea
                      id="rescheduleReason"
                      placeholder="e.g. Coach unavailable, venue change..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </FormField>
                </>
              )}
            </form>
          </div>

          <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={rescheduleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="reschedule-session-form"
                disabled={
                  !canReschedule ||
                  !newDateTime ||
                  isSameDateTime ||
                  rescheduleMutation.isPending
                }
              >
                {rescheduleMutation.isPending ? 'Saving…' : 'Reschedule'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
