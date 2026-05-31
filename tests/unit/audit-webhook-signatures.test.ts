import { describe, expect, it } from "vitest";

import {
  buildWebhookSignatureAuditReport,
  WEBHOOK_SIGNATURE_AUDIT_POLICY_ID,
} from "../../scripts/audit-webhook-signatures";

describe("audit-webhook-signatures", () => {
  it("reports PASSED for all 52 webhook routes with code-level verification", () => {
    const report = buildWebhookSignatureAuditReport(process.cwd());

    expect(report.version).toBe(WEBHOOK_SIGNATURE_AUDIT_POLICY_ID);
    expect(report.totalRoutes).toBe(52);
    expect(report.expectedRouteCount).toBe(52);
    expect(report.verifiedCount).toBe(52);
    expect(report.missingVerificationCount).toBe(0);
    expect(report.matrixMismatchCount).toBe(0);
    expect(report.overall).toBe("PASSED");

    const commerce = report.routes.filter((r) =>
      ["/api/webhooks/stripe", "/api/webhooks/woocommerce"].includes(r.apiPath),
    );
    expect(commerce.every((r) => r.signatureVerifiedInCode)).toBe(true);
  });
});
