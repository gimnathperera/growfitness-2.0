import type { Session as SharedSession } from '@grow-fitness/shared-types';
import type { Session as DashboardSession } from '@/types/dashboard';

export function transformToDashboardSession(session: SharedSession): DashboardSession {
  return {
    id: parseInt(session.id, 10) || 0, 
    name: `Session at ${new Date(session.dateTime).toLocaleString()}`, 
    time: new Date(session.dateTime).toLocaleTimeString(),
    studentsCount: session.kids?.length || 0,
    status: 'upcoming', 
    type: session.type.toLowerCase() as 'group' | 'individual',
    location: 'Unknown', 
    students: [], 
    dates: [new Date(session.dateTime).toISOString()],
  };
}
