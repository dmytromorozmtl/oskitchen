import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_POLICY_ID,
  betaIntegrationsIntegritySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-integrity-smoke-integration-policy";
import { buildBetaIntegrationsIntegritySmokeSummary } from "@/lib/integrations/beta-integrations-integrity-smoke-summary";

describe("beta integrations integrity smoke integration policy (QA-42)", () => {
  it("locks integration policy id and summary artifact path", () => {
    expect(BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "beta-integrations-integrity-smoke-integration-v1",
    );
    expect(BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-beta-integrations-integrity-summary.json",
    );
    expect(BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT).toBe(7);
  });

  it("evaluates pass contract for integrity_complete with seven BETA rows", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: true,
    });
    expect(
      betaIntegrationsIntegritySmokeWithinPassContract({
        overall: summary.overall,
        proofStatus: summary.proofStatus,
        registryBetaCount: summary.registry.registryBetaCount,
        envTotal: summary.env.envSummary.total,
        expectedTotal: summary.registry.expectedBetaCount,
        scaffoldFailureCount: summary.registry.scaffoldFailures.length,
        registryOverall: summary.registry.overall,
        envOverall: summary.env.overall,
      }),
    ).toBe(true);
  });
});
