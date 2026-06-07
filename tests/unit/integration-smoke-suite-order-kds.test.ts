import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  INTEGRATION_SMOKE_SUITE_NATIVE_ORDER_KDS_E2E_SPECS,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_CI_SCRIPTS,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_E2E_SPEC,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID,
  INTEGRATION_SMOKE_SUITE_ORDER_KDS_WORKFLOW,
  integrationSmokeSuiteChannelOrderKdsCount,
  integrationSmokeSuiteOrderKdsIds,
  integrationSmokeSuiteRequiresKdsTicket,
} from "@/lib/integrations/integration-smoke-suite-order-kds-policy";
import {
  auditIntegrationSmokeSuiteOrderKdsWiring,
  buildIntegrationSmokeSuiteSummary,
  resolveIntegrationSmokeSuiteOverall,
} from "@/lib/integrations/integration-smoke-suite-order-kds-summary";

const ROOT = process.cwd();

describe("integration smoke suite order→KDS (Absolute Final Task 55)", () => {
  it("locks eighteen LIVE round-trip fleet entries", () => {
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_POLICY_ID).toBe(
      "integration-smoke-suite-order-kds-absolute-final-v1",
    );
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_EXPECTED_COUNT).toBe(18);
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET).toHaveLength(18);
    expect(integrationSmokeSuiteChannelOrderKdsCount()).toBe(6);
    expect(integrationSmokeSuiteOrderKdsIds()).toHaveLength(18);
    expect(INTEGRATION_SMOKE_SUITE_ORDER_KDS_KDS_PATH).toBe("/dashboard/kitchen");
  });

  it("marks channel and payment integrations as KDS-required", () => {
    const channel = INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.filter(
      (entry) => entry.roundTripKind === "channel_order_kds",
    );
    expect(channel.map((entry) => entry.integrationId)).toEqual([
      "woocommerce",
      "shopify",
      "uber-eats",
      "doordash",
      "grubhub",
      "skip",
    ]);
    for (const entry of channel) {
      expect(integrationSmokeSuiteRequiresKdsTicket(entry)).toBe(true);
      expect(entry.kdsVerification).not.toBe("not_applicable");
    }

    const syncOnly = INTEGRATION_SMOKE_SUITE_ORDER_KDS_FLEET.filter(
      (entry) => entry.roundTripKind === "sync_only",
    );
    expect(syncOnly).toHaveLength(8);
    for (const entry of syncOnly) {
      expect(entry.kdsVerification).toBe("not_applicable");
    }
  });

  it("resolves overall status from fleet steps", () => {
    expect(
      resolveIntegrationSmokeSuiteOverall([
        {
          integrationId: "woocommerce",
          name: "WooCommerce",
          roundTripKind: "channel_order_kds",
          status: "PASSED",
          smokeScript: "smoke:woo-live",
          kdsRequired: true,
        },
      ]),
    ).toBe("PASSED");

    const summary = buildIntegrationSmokeSuiteSummary([
      {
        integrationId: "shopify",
        name: "Shopify",
        roundTripKind: "channel_order_kds",
        status: "SKIPPED",
        smokeScript: "smoke:shopify-live",
        kdsRequired: true,
        reason: "missing creds",
      },
    ]);
    expect(summary.overall).toBe("SKIPPED");
  });

  it("audits orchestrator, workflow, and native E2E specs", () => {
    const audit = auditIntegrationSmokeSuiteOrderKdsWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    for (const spec of INTEGRATION_SMOKE_SUITE_NATIVE_ORDER_KDS_E2E_SPECS) {
      expect(existsSync(join(ROOT, spec)), spec).toBe(true);
    }

    expect(existsSync(join(ROOT, INTEGRATION_SMOKE_SUITE_ORDER_KDS_E2E_SPEC))).toBe(true);
    expect(readFileSync(join(ROOT, INTEGRATION_SMOKE_SUITE_ORDER_KDS_ORCHESTRATOR), "utf8")).toContain(
      "order→KDS",
    );
    expect(readFileSync(join(ROOT, INTEGRATION_SMOKE_SUITE_ORDER_KDS_WORKFLOW), "utf8")).toContain(
      "smoke:integration-suite-order-kds",
    );
  });

  it("ships npm scripts for cert and fleet orchestrator", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of INTEGRATION_SMOKE_SUITE_ORDER_KDS_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["smoke:integration-suite-order-kds"]).toContain(
      "smoke-integration-suite-order-kds.ts",
    );
  });
});
