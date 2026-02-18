import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApiMutation } from '@/hooks/useApiMutation';
import { requestsService } from '@/services/requests.service';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function RescheduleSessionDialog({
  open,
  onClose,
  sessionId,
}: Props) {
  const [newDateTime, setNewDateTime] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate, isPending } = useApiMutation(
    (data: {
      sessionId: string;
      newDateTime: string;
      reason: string;
    }) => requestsService.createRescheduleRequest(data),
    {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Reschedule request submitted successfully',
          variant: 'default',
        });
        onClose();
        setNewDateTime(null);
        setReason('');
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to submit reschedule request',
          variant: 'destructive',
        });
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!newDateTime || !reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (newDateTime <= new Date()) {
      toast({
        title: 'Error',
        description: 'Please select a future date and time',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await mutate({
        sessionId: sessionId,
        newDateTime: newDateTime.toISOString(),
        reason: reason.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewDateTime(value ? new Date(value) : null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="newDateTime">New Date & Time</Label>
              <Input
                id="newDateTime"
                type="datetime-local"
                value={newDateTime ? format(newDateTime, DATE_TIME_FORMAT) : ''}
                onChange={handleDateTimeChange}
                min={format(new Date(), DATE_TIME_FORMAT)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rescheduleReason">Reason</Label>
              <Textarea
                id="rescheduleReason"
                placeholder="Enter reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isPending || isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || isSubmitting || !newDateTime || !reason.trim()}
            >
              {isPending || isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
