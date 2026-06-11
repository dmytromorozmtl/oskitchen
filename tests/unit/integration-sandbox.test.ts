import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTEGRATION_SANDBOX_EXAMPLE_FILE,
  INTEGRATION_SANDBOX_EXPECTED_COUNT,
  INTEGRATION_SANDBOX_FLEET,
  INTEGRATION_SANDBOX_POLICY_ID,
} from "@/lib/integrations/integration-sandbox-policy";
import {
  auditIntegrationSandboxReadiness,
  hasDirectMerchantSandboxCredentials,
  isIntegrationSandboxConfigured,
  listMissingMerchantSandboxKeys,
  resolveIntegrationSandboxCredentials,
} from "@/lib/integrations/integration-sandbox-service";
import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

const ROOT = process.cwd();

describe("integration sandbox (P1-33)", () => {
  it("locks policy id and 18 LIVE surfaces", () => {
    expect(INTEGRATION_SANDBOX_POLICY_ID).toBe("integration-sandbox-p1-33-v1");
    expect(INTEGRATION_SANDBOX_FLEET).toHaveLength(INTEGRATION_SANDBOX_EXPECTED_COUNT);
    expect(INTEGRATION_SANDBOX_EXPECTED_COUNT).toBe(18);
  });

  it("covers every LIVE registry integration", () => {
    const merchantIds = INTEGRATION_SANDBOX_FLEET.filter((row) => row.kind === "merchant_live").map(
      (row) => row.integrationId,
    );
    expect(merchantIds).toHaveLength(LIVE_INTEGRATION_IDS.length);
    for (const id of LIVE_INTEGRATION_IDS) {
      expect(merchantIds, id).toContain(id);
    }
  });

  it("example env documents all merchant credential keys", () => {
    const examplePath = join(ROOT, INTEGRATION_SANDBOX_EXAMPLE_FILE);
    expect(existsSync(examplePath)).toBe(true);
    const source = readFileSync(examplePath, "utf8");
    for (const entry of INTEGRATION_SANDBOX_FLEET) {
      if (entry.kind !== "merchant_live") continue;
      for (const key of entry.merchantEnvKeys) {
        expect(source, `${entry.integrationId}:${key}`).toContain(`${key}=`);
      }
    }
  });

  it("detects configured merchant credentials", () => {
    const woo = INTEGRATION_SANDBOX_FLEET.find((row) => row.integrationId === "woocommerce")!;
    const env = {
      WOOCOMMERCE_BASE_URL: "https://store.test",
      WOOCOMMERCE_CONSUMER_KEY: "ck_test",
    };
    expect(hasDirectMerchantSandboxCredentials(woo, env)).toBe(true);
    expect(listMissingMerchantSandboxKeys(woo, env)).toEqual([
      "WOOCOMMERCE_CONSUMER_SECRET",
      "WOOCOMMERCE_WEBHOOK_SECRET",
    ]);
    expect(resolveIntegrationSandboxCredentials("woocommerce", env)).toEqual({
      WOOCOMMERCE_BASE_URL: "https://store.test",
      WOOCOMMERCE_CONSUMER_KEY: "ck_test",
    });
    expect(isIntegrationSandboxConfigured("woocommerce", env)).toBe(true);
  });

  it("treats DB channel path as configured for merchant integrations", () => {
    const env = { CHANNEL_SMOKE_CONNECTION_ID: "conn-123" };
    expect(isIntegrationSandboxConfigured("shopify", env)).toBe(true);
  });

  it("audits readiness across the fleet", () => {
    const readiness = auditIntegrationSandboxReadiness({
      E2E_STAGING_BASE_URL: "https://staging.test",
      STRIPE_SECRET_KEY: "sk_test",
      CHANNEL_SMOKE_OWNER_EMAIL: "owner@test.com",
      DATABASE_URL: "postgresql://localhost/kitchenos",
    });
    expect(readiness.rows).toHaveLength(18);
    expect(readiness.integrationHealthReady).toBe(true);
    expect(readiness.merchantConfiguredCount).toBeGreaterThan(0);
    expect(readiness.sharedMissing).not.toContain("E2E_STAGING_BASE_URL");
  });

  it("check script exists", () => {
    expect(existsSync(join(ROOT, "scripts/check-integration-sandbox.ts"))).toBe(true);
  });
});
