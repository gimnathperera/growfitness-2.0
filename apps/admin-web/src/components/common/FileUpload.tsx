import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  onFileUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [onFileUpload]
  );

  const processFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      alert(`File type must be ${accept}`);
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload file if handler provided
    if (onFileUpload) {
      setIsUploading(true);
      try {
        const uploadedUrl = await onFileUpload(file);
        onChange(uploadedUrl);
        setPreview(uploadedUrl);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
        setPreview(value); // Revert to original value
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload handler, just set the object URL as value (for local testing)
      onChange(objectUrl);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
  };

  return (
    <div className={`w-full ${className}`}>
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 sm:h-48 object-cover rounded-lg border-2 border-[var(--gf-green-deep)]"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white font-semibold text-sm sm:text-base">Uploading...</div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-4 sm:p-8
            flex flex-col items-center justify-center gap-2 sm:gap-3
            transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-[var(--gf-green)] bg-[var(--gf-green-50)]' : 'border-[var(--gf-green-deep)]/30 hover:border-[var(--gf-green)] hover:bg-[var(--gf-green-50)]/50'}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[var(--gf-green)]/10">
            {isUploading ? (
              <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-[var(--gf-green)] border-t-transparent rounded-full" />
            ) : (
              <Upload size={20} className="text-[var(--gf-green)] sm:size-24" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-semibold text-[var(--gf-green-deep)]">
              {isUploading ? 'Uploading...' : 'Drag & drop image here'}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--fg-2)] mt-1">
              or click to browse
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--fg-3)] mt-2">
              Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
