import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";
import {
  LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT,
  LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET,
  LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH,
  LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID,
  LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integrations-staging-smoke-policy";
import {
  auditLiveIntegrationsStagingSmokeWiring,
  buildLiveIntegrationsStagingSmokeSummary,
  listMissingLiveIntegrationsStagingSharedEnvVars,
  resolveLiveIntegrationsStagingSmokeOverall,
} from "@/lib/integrations/live-integrations-staging-smoke-summary";

const ROOT = process.cwd();

describe("live integrations staging smoke", () => {
  it("locks policy id, artifact path, and fleet size 18", () => {
    expect(LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID).toBe(
      "absolute-final-live-integrations-staging-v1",
    );
    expect(LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_ARTIFACT).toBe(
      "artifacts/live-integrations-staging-smoke-summary.json",
    );
    expect(LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET).toHaveLength(
      LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT,
    );
    expect(LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT).toBe(18);
  });

  it("covers every LIVE registry integration plus Integration Health dashboard", () => {
    const merchantIds = LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.filter(
      (row) => row.kind === "merchant_live",
    ).map((row) => row.integrationId);
    expect(merchantIds).toHaveLength(LIVE_INTEGRATION_IDS.length);
    for (const id of LIVE_INTEGRATION_IDS) {
      expect(merchantIds, id).toContain(id);
    }
    const health = LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.find(
      (row) => row.integrationId === "integration-health",
    );
    expect(health?.kind).toBe("integration_health_probe");
    expect(LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health/live",
    );
  });

  it("maps each merchant integration to an npm live smoke script", () => {
    for (const entry of LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET) {
      if (entry.kind !== "merchant_live") continue;
      expect(entry.smokeScript, entry.integrationId).toMatch(/^smoke:/);
      expect(entry.summaryArtifact, entry.integrationId).toMatch(/^artifacts\//);
      expect(entry.merchantEnvKeys.length, entry.integrationId).toBeGreaterThan(0);
    }
  });

  it("audits orchestrator wiring", () => {
    const audit = auditLiveIntegrationsStagingSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("includes fleet orchestrator with provider loop", () => {
    const orchestrator = readFileSync(
      join(ROOT, "scripts/smoke-live-integrations-staging.ts"),
      "utf8",
    );
    expect(orchestrator).toContain("LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET");
    expect(orchestrator).toContain("probeIntegrationHealthStaging");
  });

  it("lists missing shared staging env vars", () => {
    const missing = listMissingLiveIntegrationsStagingSharedEnvVars({});
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("CHANNEL_SMOKE_CONNECTION_ID or CHANNEL_SMOKE_OWNER_EMAIL");
  });

  it("resolves overall FAILED when any step failed", () => {
    expect(
      resolveLiveIntegrationsStagingSmokeOverall([
        { integrationId: "a", name: "A", status: "PASSED", smokeScript: "smoke:a" },
        { integrationId: "b", name: "B", status: "FAILED", smokeScript: "smoke:b" },
      ]),
    ).toBe("FAILED");
  });

  it("builds SKIPPED summary when all steps skipped", () => {
    const summary = buildLiveIntegrationsStagingSmokeSummary([
      {
        integrationId: "woocommerce",
        name: "WooCommerce",
        status: "SKIPPED",
        smokeScript: "smoke:woo-live",
        reason: "missing credentials",
      },
    ]);
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.skippedCount).toBe(1);
    expect(summary.honestyNote).toContain("SKIPPED");
  });

  it("registers GHA workflow for staging smoke", () => {
    expect(
      existsSync(join(ROOT, ".github/workflows/live-integrations-staging-smoke.yml")),
    ).toBe(true);
  });
});
