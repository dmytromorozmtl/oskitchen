import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATION_SCAFFOLD_PATHS,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
} from "@/lib/integrations/beta-integrations-registry-smoke-era17-policy";
import {
  auditBetaIntegrationsRegistryScaffold,
  buildBetaIntegrationsRegistrySmokeSummary,
  resolveBetaIntegrationsRegistryOverall,
  resolveBetaIntegrationsRegistryProofStatus,
} from "@/lib/integrations/beta-integrations-registry-smoke-summary";
import { BETA_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

describe("beta integrations registry smoke summary", () => {
  it("resolves PASSED only when cert + scaffold + registry counts align", () => {
    const proofStatus = resolveBetaIntegrationsRegistryProofStatus({
      certPassed: true,
      scaffoldFailures: [],
      registryBetaCount: BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
      placeholderCount: 0,
    });
    expect(proofStatus).toBe("scaffold_complete");
    expect(resolveBetaIntegrationsRegistryOverall(proofStatus)).toBe("PASSED");
  });

  it("fails when placeholder integrations remain", () => {
    const proofStatus = resolveBetaIntegrationsRegistryProofStatus({
      certPassed: true,
      scaffoldFailures: [],
      registryBetaCount: 17,
      placeholderCount: 1,
    });
    expect(proofStatus).toBe("scaffold_incomplete");
    expect(resolveBetaIntegrationsRegistryOverall(proofStatus)).toBe("FAILED");
  });

  it("builds summary with scaffold failure details", () => {
    const summary = buildBetaIntegrationsRegistrySmokeSummary({
      certPassed: false,
      scaffoldFailures: [{ integrationId: "square", missingPaths: ["missing.ts"] }],
      registryBetaCount: 18,
      placeholderCount: 0,
    });
    expect(summary.overall).toBe("FAILED");
    expect(summary.scaffoldFailures).toHaveLength(1);
  });
});

describe("beta integrations registry smoke (live repo scaffold audit)", () => {
  it("maps all eighteen BETA ids to scaffold paths", () => {
    expect(BETA_INTEGRATION_IDS).toHaveLength(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT);
    for (const id of BETA_INTEGRATION_IDS) {
      expect(BETA_INTEGRATION_SCAFFOLD_PATHS[id]?.length, id).toBeGreaterThan(0);
    }
  });

  it("passes live scaffold audit for all eighteen BETA integrations", () => {
    const audit = auditBetaIntegrationsRegistryScaffold(process.cwd());
    expect(audit.registryBetaCount).toBe(BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT);
    expect(audit.placeholderCount).toBe(0);
    expect(audit.scaffoldFailures).toEqual([]);
  });
});
