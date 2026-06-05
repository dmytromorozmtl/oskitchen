import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_POLICY_ID,
  betaIntegrationsRegistrySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-registry-smoke-integration-policy";
import {
  auditBetaIntegrationsRegistryScaffold,
  buildBetaIntegrationsRegistrySmokeSummary,
} from "@/lib/integrations/beta-integrations-registry-smoke-summary";

describe("beta integrations registry smoke integration policy (QA-44)", () => {
  it("locks integration policy id and summary artifact path", () => {
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "beta-integrations-registry-smoke-integration-v1",
    );
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-beta-integrations-registry-summary.json",
    );
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT).toBe(14);
  });

  it("evaluates pass contract for scaffold_complete with zero placeholders", () => {
    const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: true,
      scaffoldFailures: audit.scaffoldFailures,
      registryBetaCount: audit.registryBetaCount,
      placeholderCount: audit.placeholderCount,
    });
    expect(
      betaIntegrationsRegistrySmokeWithinPassContract({
        overall: summary.overall,
        proofStatus: summary.proofStatus,
        registryBetaCount: summary.registryBetaCount,
        expectedBetaCount: summary.expectedBetaCount,
        placeholderCount: summary.placeholderCount,
        scaffoldFailureCount: summary.scaffoldFailures.length,
        certPassed: summary.certPassed,
      }),
    ).toBe(true);
  });
});
