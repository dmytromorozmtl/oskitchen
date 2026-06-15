import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAuditReasonMetadata } from "@/services/audit/audit-reason-service";

describe("buildAuditReasonMetadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to PREVIEW_ONLY with bounded preview", () => {
    const m = buildAuditReasonMetadata({
      rawReason: `${"a".repeat(120)} sk_live_1234567890`,
      category: "WEBHOOK_REPLAY",
    });
    expect(m.reasonRetentionMode).toBe("PREVIEW_ONLY");
    expect(String(m.reasonPreview).length).toBeLessThanOrEqual(80);
    expect(String(m.reasonPreview)).not.toContain("sk_live_");
  });

  it("HASHED mode stores hash not full text in preview", () => {
    vi.stubEnv("AUDIT_REASON_RETENTION_MODE", "HASHED");
    const m = buildAuditReasonMetadata({ rawReason: "rotate signing secret", category: "WEBHOOK_REPLAY" });
    expect(m.reasonRetentionMode).toBe("HASHED");
    expect(typeof m.reasonHash).toBe("string");
    expect(String(m.reasonHash).length).toBeGreaterThan(20);
  });
});
