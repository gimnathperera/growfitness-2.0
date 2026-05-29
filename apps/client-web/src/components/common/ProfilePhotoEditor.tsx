import { useEffect, useMemo } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDropzone } from '@/components/common/FileDropzone';

const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

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

  const handleRemove = () => {
    if (pendingFile) {
      onPendingFileChange(null);
      return;
    }

    onPhotoRemovedChange(true);
  };

  const handleFileChange = (file: File | null) => {
    onPendingFileChange(file);
    if (file) {
      onPhotoRemovedChange(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start rounded-lg border bg-muted/30 p-4">
      <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt="" className="object-cover" /> : null}
        <AvatarFallback className="text-lg">
          {fallbackLabel.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2 w-full sm:w-auto">
        <Label>Profile photo</Label>
        <FileDropzone
          value={pendingFile}
          onChange={handleFileChange}
          accept={IMAGE_UPLOAD_TYPES}
          maxSizeBytes={MAX_IMAGE_UPLOAD_BYTES}
          preview="image"
          label="Drop photo here or browse"
          description="JPEG, PNG, or WebP up to 5MB"
          disabled={disabled || uploading}
        />

        {hasRemovablePhoto && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove photo
          </Button>
        )}

        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </div>
        )}
      </div>
    </div>
  );
}
