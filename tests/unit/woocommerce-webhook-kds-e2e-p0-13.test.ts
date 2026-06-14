import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_ARTIFACT,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CHECK_NPM_SCRIPT,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CI_NPM_SCRIPT,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_DOC,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_NPM_SCRIPT,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_SPEC,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_EXTENDS_POLICY_ID,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-webhook-kds-e2e-p0-13-policy";
import {
  buildWooCommerceWebhookKdsE2ETestPayload,
} from "@/services/integrations/woocommerce-webhook-kds-e2e-p0-13";

const ROOT = process.cwd();

describe("woocommerce webhook → KDS E2E (P0-13)", () => {
  it("locks P0-13 policy, artifact, and required chain steps", () => {
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID).toBe(
      "p0-13-woocommerce-webhook-kds-e2e-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_EXTENDS_POLICY_ID).toBe(
      "p0-2-woocommerce-webhook-kds-live-smoke-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_ARTIFACT).toBe(
      "artifacts/woocommerce-webhook-kds-e2e.json",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU).toBe("GOLDEN-WOO-1");
    expect(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS).toEqual([
      "test_payload",
      "webhook_event_persisted",
      "kitchen_task_linked",
      "kds_ticket_visible",
    ]);
  });

  it("builds synthetic webhook test payload", () => {
    const payload = buildWooCommerceWebhookKdsE2ETestPayload("p0-13-test-1");
    expect(payload.id).toBe("p0-13-test-1");
    const items = payload.line_items as Array<{ sku?: string }>;
    expect(items[0]?.sku).toBe(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU);
  });

  it("wires webhook processor ingest path", () => {
    const processor = readFileSync(
      join(ROOT, "lib/webhooks/woocommerce-webhook-processor.ts"),
      "utf8",
    );
    expect(processor).toContain("executeWooCommerceWebhookBusinessLogic");
    const smoke = readFileSync(
      join(ROOT, "services/integrations/woocommerce-webhook-kds-smoke.ts"),
      "utf8",
    );
    expect(smoke).toContain("ingestWooCommerceWebhookForSmoke");
    expect(smoke).toContain("ensureKitchenTaskForKdsSmoke");
  });

  it("documents P0-13 and wires E2E + npm scripts", () => {
    for (const rel of WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_DOC), "utf8");
    expect(doc).toContain(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID);
    expect(doc).toContain("WebhookEvent");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CHECK_NPM_SCRIPT]).toContain(
      "woocommerce-webhook-kds-e2e-p0-13.test.ts",
    );
    expect(pkg.scripts?.[WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CI_NPM_SCRIPT]).toContain(
      "woocommerce-webhook-kds-e2e-p0-13.test.ts",
    );
    expect(pkg.scripts?.[WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_NPM_SCRIPT]).toContain(
      WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_SPEC,
    );

    const artifact = JSON.parse(
      readFileSync(join(ROOT, WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_ARTIFACT), "utf8",
      ),
    ) as { policyId: string; requiredStepIds: string[] };
    expect(artifact.policyId).toBe(WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID);
    expect(artifact.requiredStepIds).toEqual([
      ...WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS,
    ]);
    expect(existsSync(join(ROOT, WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_SPEC))).toBe(true);
  });
});
