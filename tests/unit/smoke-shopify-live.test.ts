import { describe, expect, it } from "vitest";

import {
  buildShopifyLiveSmokeSummary,
  listMissingShopifyLiveSmokeEnvVars,
  readShopifyLiveSmokeEnv,
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
});
