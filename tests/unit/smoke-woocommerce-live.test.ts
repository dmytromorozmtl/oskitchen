import { describe, expect, it } from "vitest";

import {
  buildWooCommerceLiveSmokeSummary,
  formatWooPingFailureDetail,
  listMissingWooCommerceLiveSmokeEnvVars,
  readWooCommerceLiveSmokeEnv,
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
});
