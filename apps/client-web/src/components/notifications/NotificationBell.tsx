import { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useApiQuery, useApiMutation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { NotificationBubble } from './NotificationBubble';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_SOUND_URL =
  `${(import.meta.env.BASE_URL || '/').replace(/\/*$/, '')}/sounds/notification.mp3`;

let notificationAudio: HTMLAudioElement | null = null;

function getNotificationAudio(): HTMLAudioElement {
  if (!notificationAudio) {
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.volume = 0.5;
  }
  return notificationAudio;
}

function unlockNotificationSound() {
  const audio = getNotificationAudio();
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play().then(() => audio.pause()).catch(() => {});
  }
}

function playNotificationSound() {
  const audio = getNotificationAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 800;
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore if AudioContext not allowed
    }
  });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState('');
  const previousUnreadCountRef = useRef<number | undefined>(undefined);
  const bubbleAutoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { confirm, confirmState } = useConfirm();

  const { data: unreadData } = useApiQuery(
    ['notifications', 'unread-count'],
    () => notificationsService.getUnreadCount(),
    { refetchInterval: 30_000 }
  );

  const { data: listData } = useApiQuery(
    ['notifications', 'list', open ? 'open' : 'closed'],
    () => notificationsService.getNotifications(1, 20),
    { enabled: open }
  );

  const unreadCount = unreadData?.count ?? 0;
  const notifications = listData?.data ?? [];

  useEffect(() => {
    const prev = previousUnreadCountRef.current;

    if (prev !== undefined && unreadCount > prev) {
      const added = unreadCount - prev;

      setTimeout(() => {
        setBubbleMessage(
          added === 1
            ? 'You have 1 new notification'
            : `You have ${added} new notifications`
        );

        setBubbleVisible(true);
        playNotificationSound();

        if (bubbleAutoDismissRef.current) {
          clearTimeout(bubbleAutoDismissRef.current);
        }

        bubbleAutoDismissRef.current = setTimeout(() => {
          setBubbleVisible(false);
          bubbleAutoDismissRef.current = null;
        }, 8000);
      }, 0);
    }

    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const markReadMutation = useApiMutation(
    (id: string) => notificationsService.markAsRead(id),
    { invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']] }
  );

  const markAllReadMutation = useApiMutation(
    () => notificationsService.markAllAsRead(),
    { invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']] }
  );

  const deleteOneMutation = useApiMutation(
    (id: string) => notificationsService.deleteOne(id),
    { invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']] }
  );

  const clearAllMutation = useApiMutation(
    () => notificationsService.clearAll(),
    { invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']] }
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) unlockNotificationSound();
  };

  const handleMarkAsRead = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear all notifications',
      description:
        'Are you sure you want to remove all notifications? This cannot be undone.',
      confirmText: 'Clear all',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      clearAllMutation.mutate(undefined!);
    }
  };

  const handleDismissBubble = () => {
    setBubbleVisible(false);

    if (bubbleAutoDismissRef.current) {
      clearTimeout(bubbleAutoDismissRef.current);
      bubbleAutoDismissRef.current = null;
    }
  };

  const handleConfirmDialogOpenChange = (open: boolean) => {
    if (!open) {
      confirmState.onCancel();
    }
  };

  return (
    <>
      <NotificationBubble
        visible={bubbleVisible}
        message={bubbleMessage}
        onDismiss={handleDismissBubble}
        onOpenList={() => setOpen(true)}
      />

      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <div className="flex flex-col gap-1 px-2 py-1.5 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Notifications</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => markAllReadMutation.mutate(undefined!)}
                  >
                    Mark all read
                  </button>
                )}

                {notifications.length > 0 && (
                  <>
                    <span className="text-muted-foreground text-xs">|</span>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={handleClearAll}
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'group flex items-start gap-2 border-b last:border-b-0 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                    !n.read && 'bg-muted/50'
                  )}
                >
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => handleMarkAsRead(n)}
                  >
                    <p className="font-medium truncate text-sm">{n.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <p className="text-muted-foreground text-[10px] mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-70 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOneMutation.mutate(n.id);
                    }}
                    aria-label="Clear notification"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={handleConfirmDialogOpenChange}
        title={confirmState.options?.title ?? ''}
        description={confirmState.options?.description ?? ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        variant={confirmState.options?.variant}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}