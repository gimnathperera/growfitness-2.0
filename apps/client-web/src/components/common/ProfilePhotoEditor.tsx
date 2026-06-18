import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPT_ATTR = IMAGE_UPLOAD_TYPES.join(',');

export interface ProfilePhotoEditorProps {
  savedPhotoUrl?: string;
  pendingFile: File | null;
  onPendingFileChange: (file: File | null) => void;
  photoRemoved: boolean;
  onPhotoRemovedChange: (removed: boolean) => void;
  fallbackLabel: string;
  disabled?: boolean;
  uploading?: boolean;
  helperText?: string;
}

export function ProfilePhotoEditor({
  savedPhotoUrl,
  pendingFile,
  onPendingFileChange,
  photoRemoved,
  onPhotoRemovedChange,
  fallbackLabel,
  disabled = false,
  uploading = false,
  helperText,
}: ProfilePhotoEditorProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const pendingPreviewUrl = useMemo(() => {
    if (!pendingFile) return null;
    return URL.createObjectURL(pendingFile);
  }, [pendingFile]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const avatarSrc =
    pendingPreviewUrl ?? (!photoRemoved && savedPhotoUrl?.trim() ? savedPhotoUrl : undefined);
  const hasRemovablePhoto = Boolean(pendingFile || (savedPhotoUrl?.trim() && !photoRemoved));
  const isInteractive = !disabled && !uploading;

  const validateFile = (file: File): string | null => {
    if (!IMAGE_UPLOAD_TYPES.includes(file.type)) {
      return 'Please choose a JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return 'Image must be 5MB or smaller.';
    }
    return null;
  };

  const applyFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({ title: 'Invalid photo', description: error, variant: 'destructive' });
      return;
    }
    onPendingFileChange(file);
    onPhotoRemovedChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = '';
  };

  const openPicker = () => {
    if (!isInteractive) return;
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingFile) {
      onPendingFileChange(null);
      return;
    }
    onPhotoRemovedChange(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isInteractive) return;
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={handleInputChange}
        disabled={!isInteractive}
      />

      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-label="Change profile photo"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (isInteractive) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={[
          'relative h-28 w-28 rounded-2xl outline-none transition-transform',
          isInteractive ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default opacity-80',
          isDragOver ? 'ring-2 ring-primary ring-offset-2' : '',
        ].join(' ')}
      >
        <Avatar className="h-28 w-28 rounded-2xl border-4 border-card shadow-[var(--shadow-card)] border-border">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" className="object-cover" /> : null}
          <AvatarFallback className="rounded-2xl bg-secondary text-xl font-bold text-secondary-foreground">
            {fallbackLabel.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Hover/dim overlay */}
        {isInteractive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition-colors group-hover:bg-black/30 hover:bg-black/30">
            <Camera className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
          </div>
        )}

        {/* Uploading spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {/* Camera badge */}
        {isInteractive && (
          <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md">
            <Camera className="h-4 w-4" />
          </div>
        )}

        {/* Remove badge */}
        {hasRemovablePhoto && isInteractive && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            aria-label="Remove photo"
            className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-md"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={openPicker}
          disabled={!isInteractive}
          className="text-xs font-medium text-primary hover:underline disabled:cursor-default disabled:opacity-60 disabled:no-underline"
        >
          {avatarSrc ? 'Change photo' : 'Upload photo'}
        </button>
        {helperText && <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>}
      </div>
    </div>
  );
}