import { Bell, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBubbleProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  onOpenList?: () => void;
  className?: string;
}

export function NotificationBubble({
  visible,
  message,
  onDismiss,
  onOpenList,
  className,
}: NotificationBubbleProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex w-[380px] min-w-[380px] items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.06)] dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200',
        className
      )}
      role="alert"
    >
      {/* Icon block: same vertical rhythm as content */}
      <div className="flex shrink-0 items-center justify-center self-stretch rounded-xl bg-gradient-to-r from-[#3d8b3d] to-[#5cb85c] px-2.5 py-2">
        <Bell className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
      </div>

      {/* Content: even padding, compact vertical spacing */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#5cb85c]">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Notifications
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 h-7 w-7 shrink-0 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-foreground">
          {message}
        </p>
        {onOpenList && (
          <Button
            variant="link"
            size="sm"
            className="h-auto w-fit p-0 text-sm font-normal text-[#5cb85c] hover:underline"
            onClick={onOpenList}
          >
            View all →
          </Button>
        )}
      </div>
    </div>
  );
}
