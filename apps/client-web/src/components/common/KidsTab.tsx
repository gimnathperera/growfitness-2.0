import { useMemo, useState } from 'react';
import { Baby, ChevronDown, ChevronUp } from 'lucide-react';
import { SessionType, type Kid, type SessionKidRef } from '@grow-fitness/shared-types';
import { Button } from '@/components/ui/button';

const AVATAR_COLORS = [
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
];

type Props = {
  kids: (Kid | SessionKidRef | string)[];
  isGroupSession: boolean;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ─────────────────────────────────────────────
   Kid Row
───────────────────────────────────────────── */

function KidRow({
  kid,
  index,
  isLoadingKid,
}: {
  kid: Kid;
  index: number;
  isLoadingKid: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = getInitials(kid.name || '?');

  const fullKid = kid as Kid & {
    stage?: string;
    gender?: string;
    mealPlan?: string | null;
  };

  const age = fullKid.birthDate
    ? Math.floor(
        (Date.now() - new Date(fullKid.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : null;

  // const mealPlan = fullKid.mealPlan ?? null;

  // const mealFollowing =
  //   mealPlan === 'following' || mealPlan === 'Following';

  function handleSaveNote() {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  if (isLoadingKid) {
    return (
      <div className="flex items-center gap-3 px-3 py-3 border-b animate-pulse">
        <div className="w-8 h-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-2.5 w-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/40 text-left"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${color.bg} ${color.text}`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{kid.name}</p>
          <p className="text-xs text-muted-foreground">
            {age != null ? `${age} yrs` : ''}
           {fullKid.stage ? ` · ${fullKid.stage}` : ''} 
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100">
            {fullKid.gender || 'N/A'}
          </span>

          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-muted/20 space-y-3">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add note..."
            className="w-full text-xs p-2 border rounded"
          />

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={!note.trim()}
            >
              {noteSaved ? 'Saved ✓' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KidsTab
───────────────────────────────────────────── */

export default function KidsTab({ kids }: Props) {
  const [search, setSearch] = useState('');
  const [filterMeal, setFilterMeal] = useState('');
  const [filterGender, setFilterGender] = useState('');

  const filtered = useMemo(() => {
    return kids.filter(k => {
      if (typeof k === 'string') return true;

      const kid = k as Kid;

      const q = search.toLowerCase();
      if (q && !kid.name?.toLowerCase().includes(q)) return false;

      if (filterGender) {
        const gender = (kid.gender ?? '').toLowerCase();
        if (gender !== filterGender.toLowerCase()) return false;
      }

      const mealPlan = kid.mealPlan ?? null;

      const following =
        mealPlan === 'following' || mealPlan === 'Following';

      if (filterMeal === 'following' && !following) return false;
      if (filterMeal === 'not' && following) return false;

      return true;
    });
  }, [kids, search, filterMeal, filterGender]);

  if (!kids.length) {
    return (
      <div className="flex flex-col items-center py-10 text-muted-foreground">
        <Baby className="h-8 w-8 mb-2" />
        No kids in this session
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Filters */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 text-sm rounded"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filterMeal}
          onChange={e => setFilterMeal(e.target.value)}
          className="text-sm border rounded px-2"
        >
          <option value="">All meals</option>
          <option value="following">Following</option>
          <option value="not">Not following</option>
        </select>

        <select
          value={filterGender}
          onChange={e => setFilterGender(e.target.value)}
          className="text-sm border rounded px-2"
        >
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* List */}
      <div className="border rounded-xl overflow-hidden">
        {filtered.map((kid, i) => {
          const isLoadingKid = typeof kid === 'string';

          const normalizedKid: Kid =
            isLoadingKid
              ? ({
                  id: kid,
                  name: 'Loading...',
                  birthDate: new Date(0),
                  parentId: '',
                  gender: '',
                  currentlyInSports: false,
                  medicalConditions: [],
                  sessionType: SessionType.GROUP,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as Kid)
              : (kid as Kid);

          return (
            <KidRow
              key={normalizedKid.id}
              kid={normalizedKid}
              index={i}
              isLoadingKid={isLoadingKid}
            />
          );
        })}
      </div>
    </div>
  );
}