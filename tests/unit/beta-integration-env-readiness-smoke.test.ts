import { describe, expect, it } from "vitest";

import {
  buildBetaIntegrationEnvReadinessSmokeSummary,
  resolveBetaIntegrationEnvReadinessSmokeOverall,
  resolveBetaIntegrationEnvReadinessSmokeProofStatus,
} from "@/lib/integrations/beta-integration-env-readiness-smoke-summary";
import { listBetaIntegrationEnvReadinessCards } from "@/lib/integrations/beta-integration-env-readiness";

describe("beta integration env readiness smoke summary", () => {
  it("passes audit when cert succeeds with eighteen cards", () => {
    const cards = listBetaIntegrationEnvReadinessCards({});
    const proofStatus = resolveBetaIntegrationEnvReadinessSmokeProofStatus({
      certPassed: true,
      strictMode: false,
      envSummary: { total: 18, readyCount: 0, optionalCount: 1, missingCount: 17, overall: "degraded" },
      cardCount: cards.length,
    });
    expect(proofStatus).toBe("env_audit_complete");
    expect(resolveBetaIntegrationEnvReadinessSmokeOverall(proofStatus)).toBe("PASSED");
  });

  it("fails strict mode when no integrations are ready or optional", () => {
    const proofStatus = resolveBetaIntegrationEnvReadinessSmokeProofStatus({
      certPassed: true,
      strictMode: true,
      envSummary: { total: 18, readyCount: 0, optionalCount: 0, missingCount: 18, overall: "blocked" },
      cardCount: 18,
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
    expect(summary.envSummary.total).toBe(16);
    expect(summary.missingIntegrations.length).toBeGreaterThan(0);
  });
});

describe("beta integration env readiness smoke (live audit)", () => {
  it("audits eighteen BETA integrations from live registry", () => {
    const cards = listBetaIntegrationEnvReadinessCards(process.env);
    expect(cards).toHaveLength(18);
    expect(cards.some((c) => c.status === "optional")).toBe(true);
  });
});
