import { describe, expect, it } from "vitest";

import {
  buildShopifyLiveSmokeSummary,
  buildSyntheticShopifySmokeOrderPayload,
  listMissingShopifyLiveSmokeEnvVars,
  readShopifyLiveSmokeEnv,
  signShopifyWebhookBody,
} from "../../scripts/smoke-shopify-live";

describe("smoke-shopify-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingShopifyLiveSmokeEnvVars({
      shopDomain: null,
      adminAccessToken: null,
      appSecret: null,
      apiVersion: null,
      stagingBaseUrl: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("SHOPIFY_SHOP_DOMAIN");
  });

  it("accepts direct Shopify env path when all keys present", () => {
    const input = readShopifyLiveSmokeEnv({
      SHOPIFY_SHOP_DOMAIN: "demo.myshopify.com",
      SHOPIFY_ADMIN_ACCESS_TOKEN: "shpat_test",
      SHOPIFY_APP_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingShopifyLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildShopifyLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "SKIPPED",
          detail: "Missing: DATABASE_URL",
        },
      ],
      missingEnvVars: ["DATABASE_URL"],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("builds SKIPPED summary for placeholder store host", () => {
    const summary = buildShopifyLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "shopify_api_connection",
          label: "Shopify Admin API connection",
          status: "SKIPPED",
          detail: "placeholder host",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
  });

  it("builds PASSED summary for webhook-only synthetic path", () => {
    const summary = buildShopifyLiveSmokeSummary({
      steps: [
        { id: "env_validation", label: "Prerequisite env vars", status: "PASSED" },
        {
          id: "shopify_api_connection",
          label: "Shopify Admin API connection",
          status: "SKIPPED",
          detail: "placeholder host",
        },
        {
          id: "synthetic_order_payload",
          label: "Synthetic Shopify order payload (webhook-only)",
          status: "PASSED",
        },
        { id: "hmac_self_check", label: "HMAC signature self-check", status: "PASSED" },
        { id: "staging_webhook_delivery", label: "Signed webhook POST to staging", status: "PASSED" },
        { id: "webhook_event_persisted", label: "WebhookEvent row persisted", status: "PASSED" },
        { id: "db_canonical_order", label: "ExternalOrder row in DATABASE_URL", status: "PASSED" },
        { id: "kds_kitchen_import", label: "Kitchen import (KDS ticket source)", status: "PASSED" },
        { id: "kds_ticket_visible", label: "KDS ticket row in kitchen orders", status: "PASSED" },
        { id: "kitchen_task_linked", label: "KitchenTask linked to imported order", status: "PASSED" },
        { id: "kds_bump_ready", label: "KDS bump (order READY)", status: "PASSED" },
        { id: "inventory_sync_wiring", label: "Inventory sync on orders/create", status: "PASSED" },
      ],
      missingEnvVars: [],
      externalOrderId: "smoke-456",
    });

    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed_webhook_synthetic");
    expect(summary.honestyNote).toContain("Webhook-only PASS");
  });

  it("builds synthetic Shopify order payload with unique external id", () => {
    const payload = buildSyntheticShopifySmokeOrderPayload("5001888");
    expect(payload.id).toBe(5001888);
    expect(payload.name).toBe("#5001888");
    expect(payload.line_items).toBeTruthy();
  });

  it("signs Shopify webhook body with HMAC sha256 base64", () => {
    const sig = signShopifyWebhookBody('{"id":1}', "whsec_test");
    expect(sig).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});
