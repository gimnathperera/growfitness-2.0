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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Banner Preview</DialogTitle>
          <DialogDescription>Preview banner image</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <img src={banner.imageUrl} alt="Banner preview" className="w-full h-auto rounded-lg" />
          <div className="text-sm text-muted-foreground">
            <p>Order: {banner.order}</p>
            <p>Target Audience: {formatBannerTargetAudience(banner.targetAudience)}</p>
            <p>Status: {banner.active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
