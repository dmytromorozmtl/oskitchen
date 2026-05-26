import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  signAuditExportPayload,
  verifyAuditExportSignature,
} from "@/lib/audit/signed-export";

describe("signed audit export", () => {
  const prev = process.env.AUDIT_EXPORT_HMAC_SECRET;

  beforeEach(() => {
    process.env.AUDIT_EXPORT_HMAC_SECRET = "test-secret-phase-h";
  });

  afterEach(() => {
    process.env.AUDIT_EXPORT_HMAC_SECRET = prev;
  });

  it("signs and verifies csv payload", () => {
    const body = "id,action\n1,storefront.experiment.concluded\n";
    const at = "2026-05-16T12:00:00.000Z";
    const sig = signAuditExportPayload(body, at);
    expect(sig).toBeTruthy();
    expect(verifyAuditExportSignature({ body, exportedAt: at, signature: sig! })).toBe(true);
    expect(verifyAuditExportSignature({ body: "tampered", exportedAt: at, signature: sig! })).toBe(
      false,
    );
  });
});
