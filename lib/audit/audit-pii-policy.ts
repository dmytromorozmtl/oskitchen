/**
 * How much of a free-text "reason" (replay, destructive action, etc.) is persisted on audit metadata.
 * Configure with `AUDIT_REASON_RETENTION_MODE` (server-side only).
 */
export type AuditReasonRetentionMode =
  | "PREVIEW_ONLY"
  | "FULL_INTERNAL"
  | "REDACTED"
  | "HASHED";

export const DEFAULT_AUDIT_REASON_RETENTION_MODE: AuditReasonRetentionMode = "PREVIEW_ONLY";

export function resolveAuditReasonRetentionMode(): AuditReasonRetentionMode {
  const raw = process.env.AUDIT_REASON_RETENTION_MODE?.trim().toUpperCase();
  if (
    raw === "FULL_INTERNAL" ||
    raw === "REDACTED" ||
    raw === "HASHED" ||
    raw === "PREVIEW_ONLY"
  ) {
    return raw;
  }
  return DEFAULT_AUDIT_REASON_RETENTION_MODE;
}

export const AUDIT_REASON_PREVIEW_MAX = 80;
