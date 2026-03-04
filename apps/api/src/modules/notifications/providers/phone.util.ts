/**
 * Normalizes a phone number to E.164 format (+[country code][subscriber number])
 * for use with WhatsApp/Twilio. Returns null if the input is empty or cannot be normalized.
 *
 * @param phone - Raw phone string (e.g. "077 123 4567", "94771234567", "+94 77 123 4567")
 * @param defaultCountryCode - Country code without + (e.g. "94") used when number starts with 0
 * @returns E.164 string (e.g. "+94771234567") or null
 */
export function normalizeToE164(
  phone: string,
  defaultCountryCode: string = '94'
): string | null {
  const trimmed = (phone ?? '').trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly.length) return null;

  let normalized: string;
  if (trimmed.startsWith('+')) {
    normalized = '+' + digitsOnly;
  } else if (digitsOnly.startsWith('0')) {
    normalized = '+' + defaultCountryCode + digitsOnly.slice(1);
  } else if (digitsOnly.startsWith(defaultCountryCode) && digitsOnly.length > defaultCountryCode.length) {
    normalized = '+' + digitsOnly;
  } else {
    normalized = '+' + defaultCountryCode + digitsOnly;
  }

  if (normalized.length < 10 || normalized.length > 16) return null;
  return normalized;
}
