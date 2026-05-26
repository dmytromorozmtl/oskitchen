import { redactPhiFromMetadata } from "@/lib/compliance/hipaa-baa";

const PII_KEYS = new Set([
  "email",
  "customerEmail",
  "phone",
  "address",
  "ip",
  "userId",
  "customerId",
  "patientId",
  "mrn",
  "ssn",
]);

/** Strip workspace PII from audit metadata for PLATFORM_READONLY_AUDITOR views. */
export function redactAuditorMetadata(
  metadata: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!metadata) return null;
  const phiRedacted = redactPhiFromMetadata(metadata);
  if (!phiRedacted) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(phiRedacted)) {
    if (PII_KEYS.has(k)) continue;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = redactAuditorMetadata(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
