import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID } from "@/lib/integrations/integration-health-live-smoke-era91-policy";
import {
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CANONICAL_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CAPABILITIES,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_FLEET_SIZE,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_INTEGRATION_HEALTH_PATH,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS,
  INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_SUMMARY_ARTIFACT,
} from "@/lib/integrations/integration-health-live-smoke-era166-policy";
import {
  auditIntegrationHealthLiveSmokeEra166Wiring,
  buildIntegrationHealthLiveSmokeEra166Summary,
  resolveIntegrationHealthLiveSmokeEra166ProofStatus,
} from "@/lib/integrations/integration-health-live-smoke-era166-smoke-summary";
import { LIVE_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

const ROOT = process.cwd();

describe("integration health live smoke era166", () => {
  it("locks era166 policy, artifact path, and fleet size", () => {
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_POLICY_ID).toBe(
      "era166-integration-health-live-v1",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_SUMMARY_ARTIFACT).toBe(
      "artifacts/integration-health-live-smoke-era166-smoke-summary.json",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health/live",
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_FLEET_SIZE).toBe(
      LIVE_INTEGRATION_IDS.length + 1,
    );
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era166 with canonical Integration Health live smoke policy", () => {
    expect(INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_CANONICAL_POLICY_ID).toBe(
      INTEGRATION_HEALTH_LIVE_SMOKE_ERA91_POLICY_ID,
    );
  });

  it("covers every LIVE registry integration in Round 2 fleet cert list", () => {
    const fleetIds = INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS.map(
      (row) => row.integrationId,
    );
    expect(fleetIds).toHaveLength(LIVE_INTEGRATION_IDS.length);
    for (const id of LIVE_INTEGRATION_IDS) {
      expect(fleetIds, id).toContain(id);
    }
  });

  it("audits Round 2 provider policies and Integration Health dashboard wiring", () => {
    const audit = auditIntegrationHealthLiveSmokeEra166Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const provider of INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS) {
      expect(existsSync(join(ROOT, provider.policyPath)), provider.policyPath).toBe(true);
    }
  });

  it("includes fleet orchestrator with Round 2 provider cert loop", () => {
    const orchestrator = readFileSync(
      join(ROOT, "scripts/smoke-integration-health-live-era166.ts"),
      "utf8",
    );
    expect(orchestrator).toContain("runFleetProviderCerts");
    expect(orchestrator).toContain("INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS");
  });

  it("builds PASSED summary when all Round 2 provider certs pass", () => {
    expect(
      resolveIntegrationHealthLiveSmokeEra166ProofStatus({
        wiringOk: true,
        certPassed: true,
        fleetPassed: true,
      }),
    ).toBe("proof_passed");

    const summary = buildIntegrationHealthLiveSmokeEra166Summary({
      certPassed: true,
      providerResults: INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS.map((provider) => ({
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
    expect(summary.capabilities).toContain("health_scores");
    expect(summary.capabilities).toContain("trends");
    expect(summary.capabilities).toContain("alerts");
  });
});
