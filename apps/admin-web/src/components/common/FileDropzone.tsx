import { useEffect, useRef, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept: string[];
  maxSizeBytes: number;
  label?: string;
  description: string;
  disabled?: boolean;
  preview?: 'image' | 'file';
  /** Persisted URL from the server (shown when no new file is selected). */
  existingUrl?: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAcceptList(accept: string[]): string {
  return accept
    .map(type => type.split('/')[1]?.toUpperCase().replace('JPEG', 'JPG') ?? type)
    .join(', ');
}

function inferFileType(file: File): string {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type && type !== 'application/octet-stream') {
    return type;
  }
  if (name.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (name.endsWith('.png')) {
    return 'image/png';
  }
  if (name.endsWith('.webp')) {
    return 'image/webp';
  }

  return type;
}

export function FileDropzone({
  value,
  onChange,
  accept,
  maxSizeBytes,
  label = 'Choose file',
  description,
  disabled = false,
  preview = 'file',
  existingUrl,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value || preview !== 'image') {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [preview, value]);

  const persistedUrl = existingUrl?.trim() || null;
  const imagePreviewSrc =
    preview === 'image' ? (value ? previewUrl : persistedUrl) : null;
  const showFileRow = Boolean(value || persistedUrl);

  const selectFile = (file: File | null) => {
    if (!file) return;

    if (!accept.includes(inferFileType(file))) {
      setError(`Allowed file types: ${formatAcceptList(accept)}`);
      onChange(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`File must be ${formatFileSize(maxSizeBytes)} or smaller`);
      onChange(null);
      return;
    }

    setError(null);
    onChange(file);
  };

  const clearFile = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={event => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={event => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={event => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) {
            selectFile(event.dataTransfer.files?.[0] ?? null);
          }
        }}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-5 text-center transition-colors',
          'hover:border-primary/60 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        <span className="mt-1 text-xs text-muted-foreground">{description}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        disabled={disabled}
        className="sr-only"
        onChange={event => {
          selectFile(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      {showFileRow && (
        <div className="flex items-center gap-3 rounded-md border bg-background p-2">
          {preview === 'image' && imagePreviewSrc ? (
            <img
              src={imagePreviewSrc}
              alt=""
              className="h-14 w-14 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            {value ? (
              <>
                <p className="truncate text-sm font-medium">{value.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
              </>
            ) : persistedUrl && preview === 'file' ? (
              <>
                <p className="text-sm font-medium">Current CV</p>
                <a
                  href={persistedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline"
                >
                  View CV
                </a>
              </>
            ) : persistedUrl && preview === 'image' ? (
              <p className="text-sm font-medium text-muted-foreground">Current photo</p>
            ) : null}
          </div>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={clearFile}
              disabled={disabled}
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
