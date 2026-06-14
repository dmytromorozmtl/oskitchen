import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_ARTIFACT,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CHECK_NPM_SCRIPT,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CI_NPM_SCRIPT,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_DOC,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_NPM_SCRIPT,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_SPEC,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_EXTENDS_POLICY_ID,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WIRING_PATHS,
} from "@/lib/integrations/shopify-webhook-kds-e2e-p0-14-policy";
import {
  buildShopifyWebhookKdsE2ETestPayload,
} from "@/services/integrations/shopify-webhook-kds-e2e-p0-14";

const ROOT = process.cwd();

describe("shopify webhook → KDS E2E (P0-14)", () => {
  it("locks P0-14 policy, artifact, and required chain steps", () => {
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID).toBe(
      "p0-14-shopify-webhook-kds-e2e-v1",
    );
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_EXTENDS_POLICY_ID).toBe(
      "p0-3-shopify-webhook-kds-live-smoke-v1",
    );
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_ARTIFACT).toBe(
      "artifacts/shopify-webhook-kds-e2e.json",
    );
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU).toBe("GOLDEN-SHOPIFY-1");
    expect(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS).toEqual([
      "hmac_self_check",
      "test_payload",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "kds_ticket_visible",
    ]);
  });

  it("builds synthetic HMAC-verifiable webhook test payload", () => {
    const payload = buildShopifyWebhookKdsE2ETestPayload("5003001");
    expect(payload.id).toBe(5003001);
    const items = payload.line_items as Array<{ sku?: string }>;
    expect(items[0]?.sku).toBe(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU);
  });

  it("wires webhook processor ingest path", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/shopify-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("executeShopifyWebhookBusinessLogic");
    const smoke = readFileSync(
      join(ROOT, "services/integrations/shopify-webhook-kds-smoke.ts"),
      "utf8",
    );
    expect(smoke).toContain("ingestShopifyWebhookForSmoke");
    expect(smoke).toContain("ensureKitchenTaskForShopifyKdsSmoke");
  });

  it("documents P0-14 and wires E2E + npm scripts", () => {
    for (const rel of SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, SHOPIFY_WEBHOOK_KDS_E2E_P0_14_DOC), "utf8");
    expect(doc).toContain(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID);
    expect(doc).toContain("HMAC");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CHECK_NPM_SCRIPT]).toContain(
      "shopify-webhook-kds-e2e-p0-14.test.ts",
    );
    expect(pkg.scripts?.[SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CI_NPM_SCRIPT]).toContain(
      "shopify-webhook-kds-e2e-p0-14.test.ts",
    );
    expect(pkg.scripts?.[SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_NPM_SCRIPT]).toContain(
      SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_SPEC,
    );

    const artifact = JSON.parse(
      readFileSync(join(ROOT, SHOPIFY_WEBHOOK_KDS_E2E_P0_14_ARTIFACT), "utf8"),
    ) as { policyId: string; requiredStepIds: string[] };
    expect(artifact.policyId).toBe(SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID);
    expect(artifact.requiredStepIds).toEqual([
      ...SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS,
    ]);
    expect(existsSync(join(ROOT, SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_SPEC))).toBe(true);
  });
});
