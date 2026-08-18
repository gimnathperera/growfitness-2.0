const sessionNotificationDateFormatter = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo',
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatSessionNotificationDate(date: Date | string): string {
  return sessionNotificationDateFormatter.format(new Date(date));
}
