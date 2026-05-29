/** Whether the account email is eligible for client-web Google Calendar sync (Gmail / Googlemail). */
export function isGmailAccount(email?: string | null): boolean {
  return Boolean(email && /@(gmail|googlemail)\.com$/i.test(email));
}
