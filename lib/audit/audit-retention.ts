/** Default retention when no policy row exists (documentation + UI default). */
export const DEFAULT_AUDIT_RETENTION_DAYS = 365;

export function clampRetentionDays(days: number): number {
  if (!Number.isFinite(days)) return DEFAULT_AUDIT_RETENTION_DAYS;
  return Math.min(Math.max(Math.floor(days), 30), 3650);
}
