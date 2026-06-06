import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_INTEGRATION_HEALTH_PATH,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT,
} from "@/lib/integrations/integration-health-live-smoke-era91-policy";
import {
  auditIntegrationHealthLiveSmokeWiring,
  buildIntegrationHealthLiveSmokeEra91Summary,
  resolveIntegrationHealthLiveSmokeEra91ProofStatus,
} from "@/lib/integrations/integration-health-live-smoke-summary";
import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

const ROOT = process.cwd();

describe("integration health live smoke era91", () => {
  it("locks era91 policy, artifact path, and fleet size", () => {
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID).toBe(
      "era91-integration-health-live-smoke-v1",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_SUMMARY_ARTIFACT).toBe(
      "artifacts/integration-health-live-smoke-summary.json",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health/live",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_FLEET_SIZE).toBe(
      LIVE_INTEGRATION_IDS.length + 1,
    );
  });

  it("covers every LIVE registry integration in fleet cert list", () => {
    const fleetIds = INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS.map(
      (row) => row.integrationId,
    );
    expect(fleetIds).toHaveLength(LIVE_INTEGRATION_IDS.length);
    for (const id of LIVE_INTEGRATION_IDS) {
      expect(fleetIds, id).toContain(id);
    }
  });

  it("audits provider policies and Integration Health dashboard wiring", () => {
    const audit = auditIntegrationHealthLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const provider of INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS) {
      expect(existsSync(join(ROOT, provider.policyPath)), provider.policyPath).toBe(true);
    }
  });

  it("includes fleet orchestrator with provider cert loop", () => {
    const orchestrator = readFileSync(
      join(ROOT, "scripts/smoke-integration-health-live-era91.ts"),
      "utf8",
    );
    expect(orchestrator).toContain("runFleetProviderCerts");
    expect(orchestrator).toContain("INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS");
  });

  it("marks proof_passed only when cert, wiring, and fleet pass", () => {
    expect(
      resolveIntegrationHealthLiveSmokeEra91ProofStatus({
        wiringOk: true,
        certPassed: true,
        fleetPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveIntegrationHealthLiveSmokeEra91ProofStatus({
        wiringOk: true,
        certPassed: true,
        fleetPassed: false,
      }),
    ).toBe("proof_failed_fleet");
  });

  it("builds PASSED summary when all provider certs pass", () => {
    const summary = buildIntegrationHealthLiveSmokeEra91Summary({
      certPassed: true,
      providerResults: INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_PROVIDER_CERTS.map((provider) => ({
        integrationId: provider.integrationId,
        name: provider.name,
        era: provider.era,
        certScript: provider.certScript,
        status: "PASSED" as const,
      })),
    });

    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.fleetCertPassed).toBe(true);
    expect(summary.providersPassed).toBe(LIVE_INTEGRATION_IDS.length);
  });
});
