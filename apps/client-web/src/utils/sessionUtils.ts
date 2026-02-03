import type { Session as SharedSession } from '@grow-fitness/shared-types';
import type { Session as DashboardSession } from '@/types/dashboard';

export function transformToDashboardSession(session: SharedSession): DashboardSession {
  return {
    id: parseInt(session._id, 10) || 0, // Convert string ID to number, fallback to 0 if conversion fails
    name: `Session at ${new Date(session.dateTime).toLocaleString()}`, // Create a meaningful name
    time: new Date(session.dateTime).toLocaleTimeString(),
    studentsCount: session.kids?.length || 0,
    status: 'upcoming', // Default status
    type: session.type.toLowerCase() as 'group' | 'individual',
    location: 'Unknown', // You might want to fetch the actual location name using locationId
    students: [], // You might want to fetch the actual student names using kidIds
    dates: [new Date(session.dateTime).toISOString()],
  };
}
