import { describe, expect, it } from "vitest";

import {
  buildBetaIntegrationEnvReadinessSmokeSummary,
  resolveBetaIntegrationEnvReadinessSmokeOverall,
  resolveBetaIntegrationEnvReadinessSmokeProofStatus,
} from "@/lib/integrations/beta-integration-env-readiness-smoke-summary";
import { listBetaIntegrationEnvReadinessCards } from "@/lib/integrations/beta-integration-env-readiness";
import { BETA_INTEGRATION_IDS } from "@/lib/integrations/integration-registry";

describe("beta integration env readiness smoke summary", () => {
  it("passes audit when cert succeeds with seven BETA cards", () => {
    const cards = listBetaIntegrationEnvReadinessCards({});
    const proofStatus = resolveBetaIntegrationEnvReadinessSmokeProofStatus({
      certPassed: true,
      strictMode: false,
      envSummary: { total: 7, readyCount: 0, optionalCount: 1, missingCount: 6, overall: "degraded" },
      cardCount: cards.length,
    });
    expect(proofStatus).toBe("env_audit_complete");
    expect(resolveBetaIntegrationEnvReadinessSmokeOverall(proofStatus)).toBe("PASSED");
  });

  it("fails strict mode when no integrations are ready or optional", () => {
    const proofStatus = resolveBetaIntegrationEnvReadinessSmokeProofStatus({
      certPassed: true,
      strictMode: true,
      envSummary: { total: 7, readyCount: 0, optionalCount: 0, missingCount: 7, overall: "blocked" },
      cardCount: 7,
    });
    expect(proofStatus).toBe("proof_failed_strict_env");
  });

  it("builds summary with missing integration details", () => {
    const cards = listBetaIntegrationEnvReadinessCards({});
    const summary = buildBetaIntegrationEnvReadinessSmokeSummary({
      certPassed: true,
      cards,
      strictMode: false,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.envSummary.total).toBe(7);
    expect(summary.missingIntegrations.length).toBeGreaterThan(0);
  });
});

describe("beta integration env readiness smoke (live audit)", () => {
  it("audits seven BETA integrations from live registry", () => {
    const cards = listBetaIntegrationEnvReadinessCards(process.env);
    expect(cards).toHaveLength(BETA_INTEGRATION_IDS.length);
    expect(cards).toHaveLength(7);
    expect(cards.some((c) => c.status === "optional")).toBe(true);
  });
});
