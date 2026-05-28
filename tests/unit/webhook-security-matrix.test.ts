import { describe, expect, it } from "vitest";

import {
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
  buildWebhookSecurityMatrix,
  buildWebhookSecurityMatrixSummary,
  classifyWebhookRoute,
  listWebhookRouteFiles,
  routeFileToApiPath,
  validateWebhookSecurityMatrix,
} from "@/lib/security/webhook-security-matrix";
import { WEBHOOK_SECURITY_ERA16_POLICY_ID } from "@/lib/security/webhook-security-era16-policy";

describe("webhook security matrix", () => {
  it("discovers expected webhook route count on disk", () => {
    const routes = listWebhookRouteFiles();
    expect(routes.length).toBe(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT);
  });

  it("classifies commerce-critical routes with signature and replay", () => {
    const stripe = classifyWebhookRoute("app/api/webhooks/stripe/route.ts");
    expect(stripe.riskTier).toBe("P0");
    expect(stripe.signatureKind).toBe("stripe_construct_event");
    expect(stripe.replayProtection).toBe("billing_event_id");

    const woo = classifyWebhookRoute("app/api/webhooks/woocommerce/route.ts");
    expect(woo.riskTier).toBe("P0");
    expect(woo.replayProtection).toBe("webhook_event_store");
    expect(woo.tenantMapping).toBe("connection_cid");

    const shopify = classifyWebhookRoute("app/api/webhooks/shopify/orders-create/route.ts");
    expect(shopify.riskTier).toBe("P0");
    expect(shopify.replayProtection).toBe("webhook_event_store");
    expect(shopify.tenantMapping).toBe("shop_domain");
  });

  it("validates full matrix without errors", () => {
    const result = validateWebhookSecurityMatrix();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.entries.length).toBe(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT);
  });

  it("builds summary with commerce replay coverage", () => {
    const entries = buildWebhookSecurityMatrix();
    const summary = buildWebhookSecurityMatrixSummary(WEBHOOK_SECURITY_ERA16_POLICY_ID, entries);
    expect(summary.policyId).toBe(WEBHOOK_SECURITY_ERA16_POLICY_ID);
    expect(summary.commerceRoutesWithReplay).toBe(6);
    expect(summary.byRiskTier.P0).toBe(6);
    expect(summary.byCategory.commerce_critical).toBe(6);
  });

  it("maps route files to api paths", () => {
    expect(routeFileToApiPath("app/api/webhooks/stripe/route.ts")).toBe("/api/webhooks/stripe");
    expect(routeFileToApiPath("app/api/webhooks/shopify/orders-create/route.ts")).toBe(
      "/api/webhooks/shopify/orders-create",
    );
  });
});
