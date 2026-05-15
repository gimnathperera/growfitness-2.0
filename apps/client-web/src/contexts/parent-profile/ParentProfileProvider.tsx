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

import { profileService } from '@/services/profile.service';
import { useAuth } from '@/contexts/useAuth';

export type ParentProfileContextValue = {
  profile: User | null;
  photoUrl: string | undefined;
  displayName: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ParentProfileContext = createContext<ParentProfileContextValue | undefined>(
  undefined
);

export function ParentProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'PARENT') {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  const photoUrl = profile?.parentProfile?.photoUrl;
  const displayName =
    profile?.parentProfile?.name?.trim() ||
    user?.email?.split('@')[0] ||
    '?';

  const value = useMemo(
    (): ParentProfileContextValue => ({
      profile,
      photoUrl,
      displayName,
      isLoading,
      refresh: load,
    }),
    [profile, photoUrl, displayName, isLoading, load]
  );

  return (
    <ParentProfileContext.Provider value={value}>{children}</ParentProfileContext.Provider>
  );
}

export function useParentProfile(): ParentProfileContextValue {
  const ctx = useContext(ParentProfileContext);
  if (!ctx) {
    throw new Error('useParentProfile must be used within ParentProfileProvider');
  }
  return ctx;
}
