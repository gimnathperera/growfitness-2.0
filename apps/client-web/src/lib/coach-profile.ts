import type { User } from '@grow-fitness/shared-types';

/** Resolve coach avatar URL from API user payload (supports nested coachProfile). */
export function resolveCoachPhotoUrl(user: User | null | undefined): string | undefined {
  const url = user?.coachProfile?.photoUrl;
  if (typeof url === 'string' && url.trim()) {
    return url.trim();
  }
  return undefined;
}
