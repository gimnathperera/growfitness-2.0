'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Session } from '@grow-fitness/shared-types';

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */

interface SessionDetailsModalProps {
  session: Session | null;
  open: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const getSessionTitle = (session: Session): string => {
  switch (session.type) {
    case 'GROUP':
      return 'Group Session';
    case 'INDIVIDUAL':
      return 'Individual Session';
    default:
      return 'Session';
  }
};

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function SessionDetailsModal({
  session,
  open,
  onClose,
}: SessionDetailsModalProps) {
  if (!session) return null;

  const startDate = new Date(session.dateTime);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#243E36]">
            {getSessionTitle(session)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Type:</span>{' '}
            {getSessionTitle(session)}
          </p>

          {session.locationId && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Location:</span>{' '}
              {session.locationId}
            </p>
          )}

          <p className="text-sm text-gray-600">
            <span className="font-medium">Date:</span>{' '}
            {startDate.toLocaleDateString()}
          </p>

          <p className="text-sm text-gray-600">
            <span className="font-medium">Time:</span>{' '}
            {formatTime(session.dateTime)}
          </p>

          {session.kidId && (
            <div>
              <p className="text-sm font-medium text-gray-600">Students:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {Array.isArray(session.kidId) ? (
                  session.kidId.map((student: string, idx: number) => (
                    <li key={idx}>{student}</li>
                  ))
                ) : (
                  <li>{session.kidId}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
