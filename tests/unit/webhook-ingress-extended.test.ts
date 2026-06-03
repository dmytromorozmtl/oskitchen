import { describe, expect, it } from "vitest";

import {
  WEBHOOK_ALL_INGRESS_ROUTE_COUNT,
  WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT,
  WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES,
  buildExtendedWebhookIngressMatrix,
  validateExtendedWebhookIngressMatrix,
} from "@/lib/security/webhook-ingress-extended";
import { WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT } from "@/lib/security/webhook-security-matrix";
import {
  buildWebhookSignatureAuditReport,
  WEBHOOK_SIGNATURE_AUDIT_POLICY_ID,
} from "../../scripts/audit-webhook-signatures";

const EXTENDED_PRODUCTION_PATHS = [
  "/api/marketplace/stripe-connect/webhook",
  "/api/voice/google",
  "/api/voice/alexa",
  "/api/capital/lender-share/[token]",
] as const;

describe("webhook ingress extended — all routes (DEV-34)", () => {
  const root = process.cwd();
  const report = buildWebhookSignatureAuditReport(root);
  const extendedMatrix = buildExtendedWebhookIngressMatrix(root);
  const auditByPath = new Map(report.routes.map((r) => [r.apiPath, r]));

  it("registers 4 extended ingress routes outside /api/webhooks", () => {
    expect(WEBHOOK_EXTENDED_INGRESS_ROUTE_FILES).toHaveLength(WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT);
    expect(extendedMatrix).toHaveLength(WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT);
    expect(WEBHOOK_ALL_INGRESS_ROUTE_COUNT).toBe(
      WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT + WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT,
    );
  });

  it("extended matrix policy validation passes", () => {
    const validation = validateExtendedWebhookIngressMatrix(root);
    expect(validation.ok).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("full ingress audit covers 56 routes with PASSED overall", () => {
    expect(report.version).toBe(WEBHOOK_SIGNATURE_AUDIT_POLICY_ID);
    expect(report.coreRouteCount).toBe(52);
    expect(report.extendedRouteCount).toBe(4);
    expect(report.totalRoutes).toBe(56);
    expect(report.expectedRouteCount).toBe(56);
    expect(report.verifiedCount).toBe(56);
    expect(report.missingVerificationCount).toBe(0);
    expect(report.matrixMismatchCount).toBe(0);
    expect(report.overall).toBe("PASSED");
  });

  it.each(EXTENDED_PRODUCTION_PATHS)("%s has signature verification in source", (apiPath) => {
    const auditRow = auditByPath.get(apiPath);
    expect(auditRow, `missing audit row for ${apiPath}`).toBeDefined();
    expect(auditRow!.signatureVerifiedInCode).toBe(true);
    expect(auditRow!.codeMatchesMatrix).toBe(true);
  });
});
