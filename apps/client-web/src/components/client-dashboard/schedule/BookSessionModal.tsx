import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { locationsService } from '@/services/locations.service';
import { requestsService } from '@/services/requests.service';
import { useKid } from '@/contexts/kid/useKid';
import { SessionType, type Location } from '@grow-fitness/shared-types';
import { useAuth } from '@/contexts/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BookSessionModal({ open, onClose }: Props) {
  const { selectedKid } = useKid();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const kidId = selectedKid?.id;
  const parentId = user?.role === 'PARENT' ? user.id : null;

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  const requestSessionType: SessionType =
    selectedKid?.sessionType === SessionType.GROUP ? SessionType.GROUP : SessionType.INDIVIDUAL;

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const locationRes = await locationsService.getLocations(1, 100);
        setLocations(locationRes.data);
      } catch (error) {
        console.error('Error loading locations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  const handleSubmit = async () => {
    if (!kidId) {
      toast({
        title: 'No kid selected',
      });
      return;
    }

    if (!parentId) {
      toast({
        title: 'Only parents can request extra sessions.',
      });
      return;
    }

    if (!selectedLocationId || !preferredDateTime) {
      toast({
        title: 'Missing information',
        description: 'Please select a location and your preferred date and time.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await requestsService.createExtraSessionRequest({
        kidId,
        sessionType: requestSessionType,
        locationId: selectedLocationId,
        preferredDateTime: new Date(preferredDateTime).toISOString(),
        parentId,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['requests'] }),
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] }),
      ]);

      setSelectedLocationId('');
      setPreferredDateTime('');

      onClose();
    } catch (error: unknown) {
      console.error('Failed to create extra session request', error);

      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : null;
      toast({
        title: 'Request failed',
        description: message || "We couldn't submit your request. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Extra Session</DialogTitle>
          <DialogDescription>
            A coach will be assigned when your request is reviewed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Select Location</label>
            <select
              className="w-full border rounded-md p-2 mt-1"
              value={selectedLocationId}
              onChange={e => setSelectedLocationId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Preferred Date & Time</label>
            <Input
              type="datetime-local"
              value={preferredDateTime}
              className="mt-1"
              onChange={e => setPreferredDateTime(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Request Extra Session'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
