import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@grow-fitness/shared-types';

import { resolveCoachPhotoUrl } from '@/lib/coach-profile';
import { profileService } from '@/services/profile.service';
import { useAuth } from '@/contexts/useAuth';

export type CoachProfileContextValue = {
  profile: User | null;
  photoUrl: string | undefined;
  displayName: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const CoachProfileContext = createContext<CoachProfileContextValue | undefined>(undefined);

export function CoachProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const shouldLoadCoach = isAuthenticated && user?.role === 'COACH';
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(shouldLoadCoach);

  const load = useCallback(async () => {
    if (!shouldLoadCoach) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await profileService.getMyCoachProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [shouldLoadCoach]);

  useEffect(() => {
    void load();
  }, [load]);

  const authPhotoUrl =
    typeof user?.coachProfile?.photoUrl === 'string'
      ? user.coachProfile.photoUrl.trim() || undefined
      : undefined;
  const photoUrl = resolveCoachPhotoUrl(profile) ?? authPhotoUrl;
  const displayName =
    profile?.coachProfile?.name?.trim() ||
    user?.coachProfile?.name?.trim() ||
    user?.email?.split('@')[0] ||
    '?';

  const value = useMemo(
    (): CoachProfileContextValue => ({
      profile,
      photoUrl,
      displayName,
      isLoading,
      refresh: load,
    }),
    [profile, photoUrl, displayName, isLoading, load, user?.coachProfile]
  );

  return (
    <CoachProfileContext.Provider value={value}>{children}</CoachProfileContext.Provider>
  );
}

export function useCoachProfile(): CoachProfileContextValue {
  const ctx = useContext(CoachProfileContext);
  if (!ctx) {
    throw new Error('useCoachProfile must be used within CoachProfileProvider');
  }
  return ctx;
}
