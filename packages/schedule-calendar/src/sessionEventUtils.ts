import type { EventInput } from '@fullcalendar/core';
import { Session, SessionStatus } from '@grow-fitness/shared-types';

export function getStatusColor(status: SessionStatus): string {
  switch (status) {
    case SessionStatus.SCHEDULED:
      return '#1a73e8';
    case SessionStatus.CONFIRMED:
      return '#10b981';
    case SessionStatus.CANCELLED:
      return '#ef4444';
    case SessionStatus.COMPLETED:
      return '#70757a';
    default:
      return '#1a73e8';
  }
}

export interface SessionToEventOptions {
  /** Custom title for the event. Defaults to session.title or "Session". */
  formatTitle?: (session: Session) => string;
}

/**
 * Convert a Session to a FullCalendar EventInput.
 * Use this in both admin-web and client-web for consistent styling.
 */
export function sessionToCalendarEvent(
  session: Session,
  options?: SessionToEventOptions
): EventInput & { extendedProps: Session } {
  const start = new Date(session.dateTime);
  const end = new Date(start.getTime() + session.duration * 60000);
  const title =
    options?.formatTitle?.(session) ?? session.title ?? 'Session';

  return {
    id: session.id,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    extendedProps: session,
    backgroundColor: getStatusColor(session.status),
    borderColor: getStatusColor(session.status),
    className: 'cursor-pointer hover:opacity-80 transition-opacity',
  };
}
