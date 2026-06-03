import { describe, expect, it } from "vitest";

import {
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
  buildWebhookSecurityMatrix,
  validateWebhookSecurityMatrix,
  type WebhookSignatureKind,
} from "@/lib/security/webhook-security-matrix";
import {
  buildWebhookSignatureAuditReport,
  WEBHOOK_SIGNATURE_AUDIT_POLICY_ID,
} from "../../scripts/audit-webhook-signatures";

/**
 * CI gate — all 52 `/api/webhooks/*` routes must have signature verification in source.
 *
 * @see artifacts/webhook-signature-matrix.md
 * @see tests/unit/webhook-signatures.test.ts (HMAC crypto unit tests)
 * @see tests/unit/audit-webhook-signatures.test.ts (audit report smoke)
 */

const EXPECTED_SIGNAL_BY_KIND: Record<WebhookSignatureKind, readonly string[]> = {
  stripe_construct_event: ["stripe_construct_event"],
  woocommerce_hmac: ["woocommerce_handler", "verify_woocommerce_hmac"],
  shopify_hmac: ["shopify_handler", "verify_shopify_hmac"],
  resend_hmac: ["verify_resend_hmac"],
  slack_signature: ["verify_slack_signature", "slack_handler"],
  scim_bearer: ["scim_bearer_provision", "require_bearer_webhook_secret"],
  uber_eats_hmac: ["verify_uber_eats_hmac"],
  bearer_secret: ["require_bearer_webhook_secret", "require_configured_webhook_secret"],
};

const PRODUCTION_PARTNER_PATHS = [
  "/api/webhooks/stripe",
  "/api/webhooks/woocommerce",
  "/api/webhooks/doordash/orders",
  "/api/webhooks/grubhub/orders",
  "/api/webhooks/uber-eats/orders",
  "/api/webhooks/resend",
  "/api/webhooks/capital-lender/[partnerSlug]",
  "/api/webhooks/uber-direct",
  "/api/webhooks/shopify/app-uninstalled",
  "/api/webhooks/shopify/markets-create",
  "/api/webhooks/shopify/markets-delete",
  "/api/webhooks/shopify/markets-update",
  "/api/webhooks/shopify/orders-create",
  "/api/webhooks/shopify/orders-updated",
  "/api/webhooks/shopify/products-update",
] as const;

describe("webhook signature matrix — 52 routes", () => {
  const root = process.cwd();
  const report = buildWebhookSignatureAuditReport(root);
  const matrix = buildWebhookSecurityMatrix(root);
  const matrixByPath = new Map(matrix.map((e) => [e.apiPath, e]));
  const auditByPath = new Map(report.routes.map((r) => [r.apiPath, r]));

  it("discovers exactly 52 webhook route files", () => {
    expect(matrix).toHaveLength(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT);
    expect(report.totalRoutes).toBe(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT);
  });

  it("static audit reports PASSED with zero unverified routes", () => {
    expect(report.version).toBe(WEBHOOK_SIGNATURE_AUDIT_POLICY_ID);
    expect(report.verifiedCount).toBe(52);
    expect(report.missingVerificationCount).toBe(0);
    expect(report.matrixMismatchCount).toBe(0);
    expect(report.overall).toBe("PASSED");
    expect(report.missingVerification).toEqual([]);
    expect(report.matrixMismatches).toEqual([]);
  });

  it("security matrix policy validation passes", () => {
    const validation = validateWebhookSecurityMatrix(root);
    expect(validation.ok).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it.each(matrix.map((e) => [e.apiPath, e.signatureKind] as const))(
    "%s matches matrix signature kind %s in code",
    (apiPath, signatureKind) => {
      const auditRow = auditByPath.get(apiPath);
      expect(auditRow, `missing audit row for ${apiPath}`).toBeDefined();
      expect(auditRow!.signatureVerifiedInCode).toBe(true);
      expect(auditRow!.codeMatchesMatrix).toBe(true);

      const allowedSignals = EXPECTED_SIGNAL_BY_KIND[signatureKind];
      const hasExpectedSignal = auditRow!.detectedSignals.some((s) =>
        allowedSignals.includes(s),
      );

      // Partner HMAC routes use dedicated verify_* detectors (not bearer_secret kind).
      const partnerHmacSignals = [
        "verify_doordash_hmac",
        "verify_grubhub_hmac",
        "verify_uber_eats_hmac",
        "verify_capital_lender_hmac",
      ];
      const hasPartnerHmac = auditRow!.detectedSignals.some((s) =>
        partnerHmacSignals.includes(s),
      );

      expect(hasExpectedSignal || hasPartnerHmac).toBe(true);
    },
  );

  it("covers all 14 production-partner ingress routes", () => {
    for (const apiPath of PRODUCTION_PARTNER_PATHS) {
      expect(matrixByPath.has(apiPath), `missing matrix entry ${apiPath}`).toBe(true);
      expect(auditByPath.get(apiPath)?.signatureVerifiedInCode).toBe(true);
    }
  });

  it("lists every route alphabetically for regression diff", () => {
    const paths = report.routes.map((r) => r.apiPath).sort();
    expect(paths).toMatchInlineSnapshot(`
      [
        "/api/webhooks/bigquery-bayesian-prior",
        "/api/webhooks/bigquery-causal-discovery-outcomes",
        "/api/webhooks/bigquery-causal-lift",
        "/api/webhooks/bigquery-causal-posteriors",
        "/api/webhooks/bigquery-federated-gradients",
        "/api/webhooks/bigquery-ga4-parity",
        "/api/webhooks/bigquery-global-mesh-outcomes",
        "/api/webhooks/bigquery-homomorphic-metrics",
        "/api/webhooks/bigquery-interference-matrix",
        "/api/webhooks/bigquery-linucb-weights",
        "/api/webhooks/bigquery-off-policy",
        "/api/webhooks/bigquery-spillover-daily",
        "/api/webhooks/bigquery-workspace-acl",
        "/api/webhooks/capital-lender/[partnerSlug]",
        "/api/webhooks/cen-cenelec-digital-product-governance-registry",
        "/api/webhooks/doordash/orders",
        "/api/webhooks/eu-ai-act-art71-pmm-live",
        "/api/webhooks/eu-ai-act-live-registry",
        "/api/webhooks/eu-ai-office-conformity-sync",
        "/api/webhooks/experiment-cislunar-dtn-bundle",
        "/api/webhooks/experiment-dtn-bundle",
        "/api/webhooks/experiment-feature-stream",
        "/api/webhooks/experiment-feature-stream-flink",
        "/api/webhooks/experiment-heliopause-dtn-bundle",
        "/api/webhooks/experiment-holdout-ws-push",
        "/api/webhooks/experiment-scientist-proposal",
        "/api/webhooks/grubhub/orders",
        "/api/webhooks/icao-imo-ai-aviation-registry",
        "/api/webhooks/iso-42001-cert-body-attest",
        "/api/webhooks/iso-iec-ai-standards-harmonization-registry",
        "/api/webhooks/itu-uncitral-digital-commerce-ai-registry",
        "/api/webhooks/nist-ai-rmf-live-control-feed",
        "/api/webhooks/oecd-state-ag-ai-transparency-mesh",
        "/api/webhooks/resend",
        "/api/webhooks/scim/experiment-auditor",
        "/api/webhooks/shopify/app-uninstalled",
        "/api/webhooks/shopify/markets-create",
        "/api/webhooks/shopify/markets-delete",
        "/api/webhooks/shopify/markets-update",
        "/api/webhooks/shopify/orders-create",
        "/api/webhooks/shopify/orders-updated",
        "/api/webhooks/shopify/products-update",
        "/api/webhooks/slack/experiment-interactive",
        "/api/webhooks/stripe",
        "/api/webhooks/uber-direct",
        "/api/webhooks/uber-eats/orders",
        "/api/webhooks/uk-dsit-algorithmic-transparency",
        "/api/webhooks/un-ai-office-global-registry-mesh",
        "/api/webhooks/us-ftc-ai-transparency-live",
        "/api/webhooks/vertex-ml-model",
        "/api/webhooks/woocommerce",
        "/api/webhooks/wto-upu-cross-border-ai-trade-registry",
      ]
    `);
  });
});
