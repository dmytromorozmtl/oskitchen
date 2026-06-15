import { createHash } from "node:crypto";

/** Strip obvious high-risk patterns before any audit persistence. */
export function sanitizeAuditReasonFreeText(input: string): string {
  let s = input.trim().replace(/\s+/g, " ");
  s = s.replace(/\bsk_live_[a-zA-Z0-9]+\b/g, "[stripe_key]");
  s = s.replace(/\bsk_test_[a-zA-Z0-9]+\b/g, "[stripe_key]");
  s = s.replace(/\bBearer\s+[a-zA-Z0-9._-]+\b/gi, "Bearer [redacted]");
  s = s.replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, "[jwt]");
  s = s.replace(/\bwhsec_[a-zA-Z0-9]+\b/gi, "[webhook_secret]");
  s = s.replace(/postgresql:\/\/[^\s]+/gi, "postgresql://[redacted]");
  return s;
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
