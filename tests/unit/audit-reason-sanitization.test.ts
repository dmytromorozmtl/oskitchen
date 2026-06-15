import { afterEach, describe, expect, it } from "vitest";

import { buildAuditReasonMetadata } from "@/services/audit/audit-reason-service";
import { sanitizeAuditReasonFreeText } from "@/lib/audit/reason-sanitization";

describe("sanitizeAuditReasonFreeText", () => {
  it("redacts Stripe secret keys", () => {
    expect(sanitizeAuditReasonFreeText("rotated sk_live_abc123xyz because leak")).toContain("[stripe_key]");
    expect(sanitizeAuditReasonFreeText("test sk_test_qqq")).toContain("[stripe_key]");
  });

  it("redacts Bearer tokens and JWT-shaped strings", () => {
    expect(sanitizeAuditReasonFreeText("used Bearer abc.def.ghi in curl")).toContain("Bearer [redacted]");
    expect(sanitizeAuditReasonFreeText("saw eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig")).toContain("[jwt]");
  });

  it("redacts webhook secrets and postgres URLs", () => {
    expect(sanitizeAuditReasonFreeText("whsec_ABC123")).toContain("[webhook_secret]");
    expect(sanitizeAuditReasonFreeText("db postgresql://u:p@host:5432/db")).toContain("postgresql://[redacted]");
  });
});

describe("buildAuditReasonMetadata", () => {
  afterEach(() => {
    delete process.env.AUDIT_REASON_RETENTION_MODE;
  });

  it("defaults to preview-only metadata without raw secret-bearing substrings in preview", () => {
    const meta = buildAuditReasonMetadata({
      rawReason: "rotated sk_live_abc123 because policy",
      category: "security",
    });
    expect(meta.reasonRetentionMode).toBe("PREVIEW_ONLY");
    const preview = String(meta.reasonPreview ?? "");
    expect(preview).not.toMatch(/sk_live_/);
    expect(preview.length).toBeLessThanOrEqual(80);
  });
});
