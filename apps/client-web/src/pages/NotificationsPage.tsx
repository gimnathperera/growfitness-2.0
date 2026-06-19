import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Bell, X, ArrowLeft, Check, CheckCheck, Trash2, Search } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiQuery, useApiMutation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { notificationsService, type Notification } from '@/services/notifications.service';
import { cn } from '@/lib/utils';

import { NotificationType } from '@grow-fitness/shared-types';

type Filter = 'all' | 'unread' | 'read';

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

function groupLabel(date: Date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { confirm, confirmState } = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const { data: listData, isLoading } = useApiQuery(
    ['notifications', 'list', 'page'],
    () => notificationsService.getNotifications(1, 100),
    { refetchInterval: 30_000 }
  );
  const { data: unreadData } = useApiQuery(
    ['notifications', 'unread-count'],
    () => notificationsService.getUnreadCount(),
    { refetchInterval: 30_000 }
  );

  const notifications: Notification[] = listData?.data ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const markReadMutation = useApiMutation((id: string) => notificationsService.markAsRead(id), {
    invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']],
  });
  const markAllReadMutation = useApiMutation(() => notificationsService.markAllAsRead(), {
    invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']],
  });
  const deleteOneMutation = useApiMutation((id: string) => notificationsService.deleteOne(id), {
    invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']],
  });
  const clearAllMutation = useApiMutation(() => notificationsService.clearAll(), {
    invalidateQueries: [['notifications', 'unread-count'], ['notifications', 'list']],
  });

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === 'unread') list = list.filter(n => !n.read);
    if (filter === 'read') list = list.filter(n => n.read);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of filtered) {
      const label = groupLabel(new Date(n.createdAt));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleClearAll = async () => {
    const ok = await confirm({
      title: 'Clear all notifications',
      description: 'This permanently removes every notification. Continue?',
      confirmText: 'Clear all',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (ok) clearAllMutation.mutate(undefined!);
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }

    // Invoice-related → payments page
    if (isInvoiceRelatedNotification(n)) {
      navigate('/payments');
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
      return;
    }

    if (n.type === NotificationType.PROFILE_UPDATED) {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen">
    {/* <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white"></div> */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-emerald-100 text-emerald-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Notifications</h1>
            <p className="text-sm text-emerald-700/70">
              {unreadCount > 0 ? `${unreadCount} unread of ${notifications.length}` : `${notifications.length} total`}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Bell className="h-5 w-5" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/60" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search notifications…"
                className="pl-9 border-emerald-100 bg-emerald-50/40 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-emerald-50 p-1">
              {(['all', 'unread', 'read'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all',
                    filter === f
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-emerald-700/70 hover:text-emerald-900'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {(unreadCount > 0 || notifications.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-emerald-50">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAllReadMutation.mutate(undefined!)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <CheckCheck className="h-4 w-4 mr-1.5" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearAll}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-emerald-50/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-white py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
              <Bell className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-950">No notifications</h3>
            <p className="text-sm text-emerald-700/60 mt-1">
              {query ? 'Try a different search term.' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([label, items]) => (
              <section key={label}>
                <h2 className="px-1 mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/70">
                  {label}
                </h2>
                <div className="space-y-2">
                  {items.map(n => (
                    <article
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNotificationClick(n)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationClick(n);
                        }
                      }}
                      className={cn(
                        'group relative rounded-2xl border bg-white p-4 transition-all hover:shadow-md hover:shadow-emerald-900/5 cursor-pointer',
                        !n.read
                          ? 'border-emerald-200 ring-1 ring-emerald-100'
                          : 'border-gray-100'
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            'flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl',
                            !n.read ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
                          )}
                        >
                          <Bell className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3
                              className={cn(
                                'text-sm leading-snug break-words',
                                !n.read ? 'font-semibold text-emerald-950' : 'font-medium text-gray-800'
                              )}
                            >
                              {n.title}
                            </h3>
                            {!n.read && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                NEW
                              </span>
                            )}
                          </div>

                          {/* Full body, no truncation */}
                          <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap break-words leading-relaxed">
                            {n.body}
                          </p>

                          <div className="mt-3 flex items-center gap-3 text-[11px] text-emerald-700/60">
                            <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                            <span>·</span>
                            <span>{format(new Date(n.createdAt), 'p')}</span>
                          </div>

                          {!n.read && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                markReadMutation.mutate(n.id);
                              }}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteOneMutation.mutate(n.id);
                        }}
                        aria-label="Delete notification"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={open => !open && confirmState.onCancel()}
        title={confirmState.options?.title ?? ''}
        description={confirmState.options?.description ?? ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        variant={confirmState.options?.variant}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}
