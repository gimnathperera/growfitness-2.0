import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Banner } from '@grow-fitness/shared-types';
import { formatBannerTargetAudience } from '@/lib/formatters';

interface BannerPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner;
}

export function BannerPreviewDialog({ open, onOpenChange, banner }: BannerPreviewDialogProps) {
  if (!banner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 flex flex-col max-w-[100vw] sm:max-w-3xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] border-2 border-[var(--gf-green-deep)] bg-[var(--gf-paper)] shadow-2xl rounded-none sm:rounded-2xl">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sticky Header */}
          <div className="pb-3 border-b-2 border-[var(--gf-green-deep)]/30 bg-[var(--gf-green-50)] flex-shrink-0">
            <DialogHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
              <DialogTitle className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-[var(--gf-green-deep)]" style={{ fontFamily: 'var(--font-display)' }}>Banner Preview</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-[var(--fg-2)] font-semibold">Preview banner image</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 pb-4 min-h-0">
            <div className="space-y-4">
              <img 
                src={banner.imageUrl} 
                alt="Banner preview" 
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl border-2 border-[var(--gf-green-deep)]/30 shadow-[2px_2px_0_0_var(--gf-green-deep)]" 
              />
              <div className="text-xs sm:text-sm text-[var(--fg-2)] font-semibold space-y-1">
                <p>Order: {banner.order}</p>
                <p>Target Audience: {formatBannerTargetAudience(banner.targetAudience)}</p>
                <p>Status: {banner.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
