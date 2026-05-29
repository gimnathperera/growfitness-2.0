/** Default password reset link lifetime: 1 hour (seconds). */
export const DEFAULT_PASSWORD_RESET_TOKEN_EXPIRY_SECONDS = 3600;

/**
 * Parses PASSWORD_RESET_TOKEN_EXPIRY (seconds). Invalid or missing values fall back to default
 * so token expiry is always a valid Date (avoids Mongoose "Invalid Date" on create).
 */
export function getPasswordResetTokenExpirySeconds(
  raw: string | undefined,
  fallback = DEFAULT_PASSWORD_RESET_TOKEN_EXPIRY_SECONDS
): number {
  const parsed = parseInt(String(raw ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}
