import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const mergedClass = ['size-9', className].filter(Boolean).join(' ');
  const mergedFallback = ['bg-primary text-white', fallbackClassName].filter(Boolean).join(' ');

  return (
    <Avatar className={mergedClass}>
      {photoUrl ? <AvatarImage src={photoUrl} alt="" className="object-cover" /> : null}
      <AvatarFallback className={mergedFallback}>{letter}</AvatarFallback>
    </Avatar>
  );
}
