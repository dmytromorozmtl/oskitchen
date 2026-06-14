import { describe, expect, it } from "vitest";

import {
  buildWooCommerceLiveSmokeSummary,
  buildSyntheticWooSmokeOrderPayload,
  formatWooPingFailureDetail,
  listMissingWooCommerceLiveSmokeEnvVars,
  readWooCommerceLiveSmokeEnv,
  signWooWebhookBody,
  wooStoreHostLabel,
} from "../../scripts/smoke-woocommerce-live";

describe("smoke-woocommerce-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingWooCommerceLiveSmokeEnvVars({
      wooBaseUrl: null,
      wooConsumerKey: null,
      wooConsumerSecret: null,
      wooWebhookSecret: null,
      stagingBaseUrl: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("WOOCOMMERCE_BASE_URL");
  });

  it("accepts direct Woo env path when all keys present", () => {
    const input = readWooCommerceLiveSmokeEnv({
      WOOCOMMERCE_BASE_URL: "https://woo.example",
      WOOCOMMERCE_CONSUMER_KEY: "ck",
      WOOCOMMERCE_CONSUMER_SECRET: "cs",
      WOOCOMMERCE_WEBHOOK_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      CHANNEL_SMOKE_CONNECTION_ID: "conn-1",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingWooCommerceLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildWooCommerceLiveSmokeSummary({
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
    const summary = buildWooCommerceLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "woo_api_connection",
          label: "WooCommerce REST connection",
          status: "SKIPPED",
          detail: "placeholder host",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
  });

  it("flags placeholder store hosts in ping failure detail", () => {
    expect(wooStoreHostLabel("https://smoke-test.os-kitchen.com")).toBe("smoke-test.os-kitchen.com");
    expect(formatWooPingFailureDetail("https://smoke-test.os-kitchen.com", "fetch failed")).toContain(
      "placeholder",
    );
  });

  it("builds PASSED summary for webhook-only synthetic path", () => {
    const summary = buildWooCommerceLiveSmokeSummary({
      steps: [
        { id: "env_validation", label: "Prerequisite env vars", status: "PASSED" },
        {
          id: "woo_api_connection",
          label: "WooCommerce REST connection",
          status: "SKIPPED",
          detail: "placeholder host",
        },
        {
          id: "synthetic_order_payload",
          label: "Synthetic Woo order payload (webhook-only)",
          status: "PASSED",
        },
        { id: "hmac_self_check", label: "HMAC signature self-check", status: "PASSED" },
        { id: "webhook_event_persisted", label: "WebhookEvent row persisted", status: "PASSED" },
        { id: "staging_webhook_delivery", label: "Signed webhook POST to staging", status: "PASSED" },
        { id: "db_canonical_order", label: "ExternalOrder row in DATABASE_URL", status: "PASSED" },
        { id: "kds_kitchen_import", label: "Kitchen import (KDS ticket source)", status: "PASSED" },
        { id: "kitchen_task_linked", label: "KitchenTask linked to imported order", status: "PASSED" },
        { id: "kds_ticket_visible", label: "KDS ticket row in kitchen orders", status: "PASSED" },
        { id: "kds_bump_ready", label: "KDS bump (order READY)", status: "PASSED" },
        { id: "inventory_sync_wiring", label: "Inventory sync on order.created", status: "PASSED" },
      ],
      missingEnvVars: [],
      externalOrderId: "smoke-123",
      webhookEventId: "evt-123",
      kitchenTaskId: "task-123",
      importedOrderId: "order-123",
    });

    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed_webhook_synthetic");
    expect(summary.policyId).toBe("p0-2-woocommerce-webhook-kds-live-smoke-v1");
    expect(summary.honestyNote).toContain("WebhookEvent");
  });

  it("builds synthetic order payload with unique external id", () => {
    const payload = buildSyntheticWooSmokeOrderPayload("smoke-999");
    expect(payload.number).toBe("smoke-999");
    expect(payload.line_items).toBeTruthy();
  });

  it("signs Woo webhook body with HMAC sha256 base64", () => {
    const sig = signWooWebhookBody('{"id":1}', "whsec_test");
    expect(sig).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(signWooWebhookBody('{"id":1}', "whsec_test")).toBe(sig);
  });
});
