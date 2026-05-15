import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ReadOnlyProfilePhotoProps = {
  photoUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  helperText?: string;
};

function initials(displayName?: string | null, email?: string | null): string {
  const name = displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  const addr = email?.trim();
  return addr ? addr.charAt(0).toUpperCase() : '?';
}

/** Read-only profile photo block (same layout as parent, without upload). */
export function ReadOnlyProfilePhoto({
  photoUrl,
  displayName,
  email,
  helperText = 'Your profile photo is managed by an administrator.',
}: ReadOnlyProfilePhotoProps) {
  const fallback = initials(displayName, email);
  const imageSrc = photoUrl?.trim() || undefined;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start rounded-lg border bg-muted/30 p-4">
      <div
        className={cn(
          'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm'
        )}
      >
        {showImage ? (
          <img
            key={imageSrc}
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-lg font-medium text-muted-foreground">{fallback}</span>
        )}
      </div>
      <div className="flex-1 space-y-1 w-full sm:w-auto text-center sm:text-left">
        <Label className="text-base">Profile photo</Label>
        <p className="text-sm text-muted-foreground">{helperText}</p>
      </div>
    </div>
  );
}
