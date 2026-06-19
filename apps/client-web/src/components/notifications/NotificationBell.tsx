import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useApiQuery, useApiMutation } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { NotificationBubble } from './NotificationBubble';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/useAuth';
import { useParentProfile } from '@/contexts/parent-profile/ParentProfileProvider';
import { NotificationType } from '@grow-fitness/shared-types';

const INVOICE_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.INVOICE_STATUS_UPDATED,
  NotificationType.INVOICE_CREATED,
  NotificationType.INVOICE_CREATION_REMINDER,
  NotificationType.INVOICE_PAYMENT_REMINDER,
  NotificationType.MONTH_END_PAYMENT_REMINDER,
]);

function notificationMentionsInvoiceText(n: { title: string; body: string }): boolean {
  return /\binvoice\b/i.test(`${n.title}\n${n.body}`);
}

function isInvoiceRelatedNotification(n: Notification): boolean {
  return (
    INVOICE_NOTIFICATION_TYPES.has(n.type as NotificationType) ||
    n.entityType === 'Invoice' ||
    notificationMentionsInvoiceText(n)
  );
}

const NOTIFICATION_SOUND_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/*$/, '')}/sounds/notification.mp3`;

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
    audio
      .play()
      .then(() => audio.pause())
      .catch(() => { });
  }
}

function playNotificationSound() {
  const audio = getNotificationAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {
    try {
      const ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const parentProfile = useParentProfile();
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState('');
  const previousUnreadCountRef = useRef<number | undefined>(undefined);
  const bubbleAutoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const initializedNotificationListRef = useRef(false);
  const { confirm, confirmState } = useConfirm();

  const { data: unreadData } = useApiQuery(
    ['notifications', 'unread-count'],
    () => notificationsService.getUnreadCount(),
    { refetchInterval: 30_000 }
  );

  const { data: listData } = useApiQuery(
    ['notifications', 'list', open ? 'open' : 'closed'],
    () => notificationsService.getNotifications(1, 20),
    { refetchInterval: 30_000 }
  );

  const unreadCount = unreadData?.count ?? 0;
  const notifications = listData?.data ?? [];

  useEffect(() => {
    const prev = previousUnreadCountRef.current;

    if (prev !== undefined && unreadCount > prev) {
      const added = unreadCount - prev;

      setTimeout(() => {
        setBubbleMessage(
          added === 1 ? 'You have 1 new notification' : `You have ${added} new notifications`
        );

        setBubbleVisible(true);
        playNotificationSound();

        if (bubbleAutoDismissRef.current) {
          clearTimeout(bubbleAutoDismissRef.current);
        }

        // Notification updates can originate from other roles/screens (e.g., admin approval),
        // so refresh session-dependent widgets in the parent dashboard.
        void queryClient.invalidateQueries({ queryKey: ['sessions'] });
        void queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });

        bubbleAutoDismissRef.current = setTimeout(() => {
          setBubbleVisible(false);
          bubbleAutoDismissRef.current = null;
        }, 8000);
      }, 0);
    }

    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, queryClient]);

  useEffect(() => {
    const sessionNotificationTypes = new Set([
      'SESSION_CREATED',
      'SESSION_UPDATED',
      'SESSION_CANCELLED',
      'SESSION_DELETED',
      'SESSION_COMPLETED',
      'EXTRA_SESSION_APPROVED',
      'RESCHEDULE_APPROVED',
    ]);
    const notifications = listData?.data ?? [];
    if (!notifications.length) {
      return;
    }

    if (!initializedNotificationListRef.current) {
      notifications.forEach(n => seenNotificationIdsRef.current.add(n.id));
      initializedNotificationListRef.current = true;
      return;
    }

    let hasNewSessionAffectingNotification = false;
    let hasNewProfileUpdatedNotification = false;

    for (const n of notifications) {
      const isSeen = seenNotificationIdsRef.current.has(n.id);
      if (!isSeen) {
        seenNotificationIdsRef.current.add(n.id);
      }
      if (isSeen) {
        continue;
      }

      if (n.type === NotificationType.PROFILE_UPDATED) {
        hasNewProfileUpdatedNotification = true;
      }

      const isSessionEntityType =
        n.entityType === 'Session' || n.entityType === 'SessionRecurringGroup';
      if (sessionNotificationTypes.has(n.type) || isSessionEntityType) {
        hasNewSessionAffectingNotification = true;
      }
    }

    if (hasNewSessionAffectingNotification) {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    }

    if (hasNewProfileUpdatedNotification && role === 'PARENT') {
      void parentProfile.refresh();
    }
  }, [listData?.data, queryClient, role, parentProfile]);

  const markReadMutation = useApiMutation((id: string) => notificationsService.markAsRead(id), {
    invalidateQueries: [
      ['notifications', 'unread-count'],
      ['notifications', 'list'],
    ],
  });

  const markAllReadMutation = useApiMutation(() => notificationsService.markAllAsRead(), {
    invalidateQueries: [
      ['notifications', 'unread-count'],
      ['notifications', 'list'],
    ],
  });

  const deleteOneMutation = useApiMutation((id: string) => notificationsService.deleteOne(id), {
    invalidateQueries: [
      ['notifications', 'unread-count'],
      ['notifications', 'list'],
    ],
  });

  const clearAllMutation = useApiMutation(() => notificationsService.clearAll(), {
    invalidateQueries: [
      ['notifications', 'unread-count'],
      ['notifications', 'list'],
    ],
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) unlockNotificationSound();
  };

  const handleMarkAsRead = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }

    // Invoice-related → payments page (must run before session checks; some reminders use entityType Session)
    if (isInvoiceRelatedNotification(n)) {
      navigate('/payments');
      setOpen(false);
      return;
    }

    // Redirect to schedule tab if it's a session notification
    const sessionNotificationTypes = [
      'FREE_SESSION_REQUEST',
      'RESCHEDULE_REQUEST',
      'EXTRA_SESSION_REQUEST',
      'FREE_SESSION_SELECTED',
      'RESCHEDULE_APPROVED',
      'RESCHEDULE_DENIED',
      'EXTRA_SESSION_APPROVED',
      'EXTRA_SESSION_DENIED',
      'SESSION_CREATED',
      'SESSION_UPDATED',
      'SESSION_CANCELLED',
      'SESSION_COMPLETED',
      'SESSION_DELETED',
      'UPCOMING_SESSION_REMINDER',
    ];

    const isSessionEntityType =
      n.entityType === 'Session' || n.entityType === 'SessionRecurringGroup';
    if (sessionNotificationTypes.includes(n.type) || isSessionEntityType) {
      navigate('/dashboard?tab=schedule');
      setOpen(false); // Close dropdown
      return;
    }

    if (n.type === NotificationType.PROFILE_UPDATED) {
      navigate('/profile');
      setOpen(false);
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear all notifications',
      description: 'Are you sure you want to remove all notifications? This cannot be undone.',
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

      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full hover:bg-emerald-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-emerald-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[380px] p-0 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-900 leading-none">Notifications</h3>
                <p className="text-[11px] text-emerald-700/70 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate(undefined!)}
                  className="rounded-md px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="rounded-md px-2 py-1 font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-emerald-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-3">
                  <Bell className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-900">You're all caught up</p>
                <p className="text-xs text-emerald-700/60 mt-1">New notifications will appear here</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'group relative flex gap-3 px-5 py-4 transition-colors cursor-pointer hover:bg-emerald-50/60',
                    !n.read && 'bg-emerald-50/30'
                  )}
                  onClick={() => handleMarkAsRead(n)}
                >
                  {/* Unread dot */}
                  <div className="flex-shrink-0 pt-1.5">
                    <span
                      className={cn(
                        'block h-2 w-2 rounded-full',
                        !n.read ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-transparent'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p
                      className={cn(
                        'text-sm leading-snug break-words',
                        !n.read ? 'font-semibold text-emerald-950' : 'font-medium text-gray-800'
                      )}
                    >
                      {n.title}
                    </p>
                    {/* Full message — no truncation */}
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[11px] text-emerald-700/60 mt-2">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      deleteOneMutation.mutate(n.id);
                    }}
                    aria-label="Clear notification"
                    className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-red-500 bg-white/80"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-emerald-100 bg-emerald-50/40 px-5 py-3">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setOpen(false);
                }}
                className="w-full text-center text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                View all notifications →
              </button>
            </div>
          )}
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