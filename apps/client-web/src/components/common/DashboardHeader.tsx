import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { useKid } from '@/contexts/kid/useKid';
import { useAuth } from '@/contexts/useAuth';

export function DashboardHeader() {
  const { user, role, isLoading } = useAuth();
  const { kids, selectedKid, setSelectedKid, isLoading: isKidLoading } = useKid();

  /* ---------- ROLE CONFIG ---------- */
  const roleConfig = {
    PARENT: {
      greeting: `Hi, Welcome Back! 👋`,
      subtitle: "Track your child's fitness journey",
    },
    COACH: {
      greeting: `Hi Coach 👋`,
      subtitle: 'Ready to inspire young athletes today?',
    },
  };

  /* ---------- LOADING STATE ---------- */
  const config = role ? roleConfig[role] : null;

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* ---------- LEFT ---------- */}
        <div className="text-center md:text-left">
          <h1 className="text-base sm:text-lg font-semibold text-gray-800">{config?.greeting}</h1>
          <p className="text-xs sm:text-sm text-gray-500">{config?.subtitle}</p>

          {role === 'PARENT' && selectedKid && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              {isKidLoading ? 'Loading...' : `Selected: ${selectedKid.name}`}
            </p>
          )}
        </div>

        {/* ---------- RIGHT (KID SELECTOR) ---------- */}
        {role === 'PARENT' && (
          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-sm font-bold text-gray-700">Kid&apos;s Name:</span>

            {kids.length === 1 ? (
              <span className="px-3 py-1 rounded-md bg-gray-100 text-sm font-medium">
                {kids[0].name}
              </span>
            ) : (
              <Select
                value={selectedKid?.id ?? ''}
                onValueChange={value => {
                  const kid = kids.find(k => k.id === value);
                  if (kid) setSelectedKid(kid);
                }}
              >
                <SelectTrigger className="w-full text-sm sm:w-[200px]">
                  <SelectValue placeholder="Select Kid" />
                </SelectTrigger>

                <SelectContent>
                  {kids.map(kid => (
                    <SelectItem key={kid.id} value={kid.id}>
                      {kid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
