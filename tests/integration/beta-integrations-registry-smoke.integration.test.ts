import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_POLICY_ID,
  betaIntegrationsRegistrySmokeHonestZeroPlaceholder,
  betaIntegrationsRegistrySmokePassContract,
  betaIntegrationsRegistrySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-registry-smoke-integration-policy";
import {
  auditBetaIntegrationsRegistryScaffold,
  buildBetaIntegrationsRegistrySmokeSummary,
  formatBetaIntegrationsRegistrySmokeReportLines,
  resolveBetaIntegrationsRegistryOverall,
  resolveBetaIntegrationsRegistryProofStatus,
} from "@/lib/integrations/beta-integrations-registry-smoke-summary";

/**
 * BETA integrations registry smoke builder integration (QA-44).
 *
 * Scaffold audit → honest PASSED/FAILED artifact contract.
 *
 * @see scripts/smoke-beta-integrations-registry-era17.ts
 * @see lib/integrations/beta-integrations-registry-smoke-summary.ts
 */

describe("beta integrations registry smoke builder integration (QA-44)", () => {
  it("returns PASSED when cert chain and seven BETA scaffolds succeed", () => {
    const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: true,
      scaffoldFailures: audit.scaffoldFailures,
      registryBetaCount: audit.registryBetaCount,
      placeholderCount: audit.placeholderCount,
      commitSha: "abc1234",
    });

    const contract = betaIntegrationsRegistrySmokePassContract(summary);
    expect(betaIntegrationsRegistrySmokeWithinPassContract(contract)).toBe(true);
    expect(betaIntegrationsRegistrySmokeHonestZeroPlaceholder(summary)).toBe(true);
    expect(summary.registryBetaCount).toBe(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT);
  });

  it("returns FAILED with scaffold_incomplete when cert chain fails", () => {
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: false,
      scaffoldFailures: [],
      registryBetaCount: BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
      placeholderCount: 0,
    });

    expect(summary.overall).toBe("FAILED");
    expect(summary.proofStatus).toBe("scaffold_incomplete");
    expect(
      betaIntegrationsRegistrySmokeWithinPassContract(
        betaIntegrationsRegistrySmokePassContract(summary),
      ),
    ).toBe(false);
  });

  it("returns FAILED when scaffold failures remain", () => {
    const proofStatus = resolveBetaIntegrationsRegistryProofStatus({
      certPassed: true,
      scaffoldFailures: [{ integrationId: "square", missingPaths: ["app/page.tsx"] }],
      registryBetaCount: BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
      placeholderCount: 0,
    });
    expect(proofStatus).toBe("scaffold_incomplete");
    expect(resolveBetaIntegrationsRegistryOverall(proofStatus)).toBe("FAILED");
  });

  it("formats report lines with registry count and zero placeholders", () => {
    const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: true,
      scaffoldFailures: audit.scaffoldFailures,
      registryBetaCount: audit.registryBetaCount,
      placeholderCount: audit.placeholderCount,
    });
    const lines = formatBetaIntegrationsRegistrySmokeReportLines(summary);
    expect(lines.some((line) => line.startsWith("overall: PASSED"))).toBe(true);
    expect(
      lines.some((line) =>
        line.includes(
          `registryBetaCount: ${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT}/${BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT}`,
        ),
      ),
    ).toBe(true);
    expect(lines.some((line) => line.startsWith("placeholderCount: 0"))).toBe(true);
  });

  it("builds honest summary against real repo scaffold state", () => {
    const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: true,
      scaffoldFailures: audit.scaffoldFailures,
      registryBetaCount: audit.registryBetaCount,
      placeholderCount: audit.placeholderCount,
    });
    expect(betaIntegrationsRegistrySmokeHonestZeroPlaceholder(summary)).toBe(true);
    expect(BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "beta-integrations-registry-smoke-integration-v1",
    );
  });
});
