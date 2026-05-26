import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_HEADER = "x-kos-audit-signature";
const TIMESTAMP_HEADER = "x-kos-audit-exported-at";

export function auditExportSigningSecret(): string | null {
  return process.env.AUDIT_EXPORT_HMAC_SECRET?.trim() || null;
}

export function signAuditExportPayload(body: string, exportedAt: string): string | null {
  const secret = auditExportSigningSecret();
  if (!secret) return null;
  const payload = `${exportedAt}\n${body}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyAuditExportSignature(input: {
  body: string;
  exportedAt: string;
  signature: string;
}): boolean {
  const expected = signAuditExportPayload(input.body, input.exportedAt);
  if (!expected) return false;
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(input.signature, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export { SIGNATURE_HEADER, TIMESTAMP_HEADER };
