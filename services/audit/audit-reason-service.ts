import {
  AUDIT_REASON_PREVIEW_MAX,
  type AuditReasonRetentionMode,
  resolveAuditReasonRetentionMode,
} from "@/lib/audit/audit-pii-policy";
import { sanitizeAuditReasonFreeText, sha256Hex } from "@/lib/audit/reason-sanitization";

export type AuditReasonAuditFields = Record<string, unknown>;

/**
 * Builds audit-log metadata for a user-supplied reason. Never returns raw secrets;
 * full text only when policy is FULL_INTERNAL (still server-side DB — use sparingly).
 */
export function buildAuditReasonMetadata(params: {
  rawReason: string;
  category: string;
}): AuditReasonAuditFields {
  const policy: AuditReasonRetentionMode = resolveAuditReasonRetentionMode();
  const sanitized = sanitizeAuditReasonFreeText(params.rawReason);
  const base: AuditReasonAuditFields = {
    reasonCategory: params.category,
    reasonLength: sanitized.length,
    reasonRetentionMode: policy,
  };

  switch (policy) {
    case "PREVIEW_ONLY":
      return {
        ...base,
        reasonPreview: sanitized.slice(0, AUDIT_REASON_PREVIEW_MAX),
      };
    case "FULL_INTERNAL":
      return {
        ...base,
        reasonPreview: sanitized.slice(0, AUDIT_REASON_PREVIEW_MAX),
        reasonFullInternal: sanitized,
      };
    case "REDACTED":
      return {
        ...base,
        reasonPreview: `[${params.category}]`,
      };
    case "HASHED":
      return {
        ...base,
        reasonHash: sha256Hex(`${params.category}:${sanitized}`),
        reasonPreview: `[${params.category}]`,
      };
    default:
      return {
        ...base,
        reasonPreview: sanitized.slice(0, AUDIT_REASON_PREVIEW_MAX),
      };
  }
}
