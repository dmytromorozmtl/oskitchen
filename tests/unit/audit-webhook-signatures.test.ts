import { describe, expect, it } from "vitest";

import {
  buildWebhookSignatureAuditReport,
  WEBHOOK_SIGNATURE_AUDIT_POLICY_ID,
} from "../../scripts/audit-webhook-signatures";

describe("audit-webhook-signatures", () => {
  it("reports PASSED for all 59 webhook ingress routes with code-level verification", () => {
    const report = buildWebhookSignatureAuditReport(process.cwd());

    expect(report.version).toBe(WEBHOOK_SIGNATURE_AUDIT_POLICY_ID);
    expect(report.coreRouteCount).toBe(55);
    expect(report.extendedRouteCount).toBe(4);
    expect(report.totalRoutes).toBe(59);
    expect(report.expectedRouteCount).toBe(59);
    expect(report.verifiedCount).toBe(59);
    expect(report.missingVerificationCount).toBe(0);
    expect(report.matrixMismatchCount).toBe(0);
    expect(report.overall).toBe("PASSED");

    const commerce = report.routes.filter((r) =>
      ["/api/webhooks/stripe", "/api/webhooks/woocommerce"].includes(r.apiPath),
    );
    expect(commerce.every((r) => r.signatureVerifiedInCode)).toBe(true);
  });
});
