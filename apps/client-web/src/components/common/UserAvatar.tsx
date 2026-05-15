import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function initials(displayName?: string, email?: string): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.charAt(0) ?? '';
      const b = parts[1]?.charAt(0) ?? '';
      return (a + b).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  const addr = email?.trim();
  return addr ? addr.charAt(0).toUpperCase() : '?';
}

export type UserAvatarProps = {
  photoUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  photoUrl,
  displayName,
  email,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const letter = initials(displayName ?? undefined, email ?? undefined);
  const imageSrc = photoUrl?.trim() || undefined;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  const mergedClass = cn(
    'relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full',
    className
  );
  const mergedFallback = cn('bg-primary text-sm font-medium text-white', fallbackClassName);
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <div className={mergedClass}>
      {showImage ? (
        <img
          key={imageSrc}
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={mergedFallback}>{letter}</span>
      )}
    </div>
  );
}
