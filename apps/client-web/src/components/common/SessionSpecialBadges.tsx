import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { sessionIsExtraSession, type Session } from '@grow-fitness/shared-types';

export function SessionSpecialBadges({
  session,
  className,
}: {
  session: Session;
  className?: string;
}) {
  const extra = sessionIsExtraSession(session);
  if (!session.isFreeSession && !extra) return null;

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)} aria-label="Session markers">
      {session.isFreeSession ? (
        <Badge
          variant="secondary"
          className="h-5 border border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] font-medium text-amber-900"
        >
          Free
        </Badge>
      ) : null}
      {extra ? (
        <Badge
          variant="secondary"
          className="h-5 border border-violet-200 bg-violet-100 px-1.5 py-0 text-[10px] font-medium text-violet-900"
        >
          Extra
        </Badge>
      ) : null}
    </span>
  );
}
