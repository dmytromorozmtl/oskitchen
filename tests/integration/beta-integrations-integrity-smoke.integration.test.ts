import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_POLICY_ID,
  betaIntegrationsIntegritySmokeHonestScaffold,
  betaIntegrationsIntegritySmokePassContract,
  betaIntegrationsIntegritySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-integrity-smoke-integration-policy";
import {
  buildBetaIntegrationsIntegritySmokeSummary,
  formatBetaIntegrationsIntegritySmokeReportLines,
  resolveBetaIntegrationsIntegrityOverall,
  resolveBetaIntegrationsIntegrityProofStatus,
} from "@/lib/integrations/beta-integrations-integrity-smoke-summary";

/**
 * BETA integrations integrity smoke builder integration (QA-42).
 *
 * Registry + env cert chain → honest PASSED/FAILED artifact contract.
 *
 * @see scripts/smoke-beta-integrations-integrity-era17.ts
 * @see lib/integrations/beta-integrations-integrity-smoke-summary.ts
 */

describe("beta integrations integrity smoke builder integration (QA-42)", () => {
  it("returns PASSED when registry and env cert chains succeed with seven BETA rows", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: true,
      strictEnvMode: false,
      commitSha: "abc1234",
    });

    const contract = betaIntegrationsIntegritySmokePassContract(summary);
    expect(betaIntegrationsIntegritySmokeWithinPassContract(contract)).toBe(true);
    expect(betaIntegrationsIntegritySmokeHonestScaffold(summary)).toBe(true);
    expect(summary.registry.registryBetaCount).toBe(BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT);
    expect(summary.env.envSummary.total).toBe(BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT);
  });

  it("returns FAILED with cert_failed when registry cert chain fails", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: false,
      envCertPassed: true,
    });

    expect(summary.overall).toBe("FAILED");
    expect(summary.proofStatus).toBe("cert_failed");
    expect(
      betaIntegrationsIntegritySmokeWithinPassContract(
        betaIntegrationsIntegritySmokePassContract(summary),
      ),
    ).toBe(false);
  });

  it("returns FAILED with env_failed when env sub-audit fails", () => {
    const proofStatus = resolveBetaIntegrationsIntegrityProofStatus({
      registryCertPassed: true,
      envCertPassed: true,
      registryOverall: "PASSED",
      envOverall: "FAILED",
    });
    expect(proofStatus).toBe("env_failed");
    expect(resolveBetaIntegrationsIntegrityOverall(proofStatus)).toBe("FAILED");

    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: false,
    });
    expect(summary.overall).toBe("FAILED");
  });

  it("formats report lines with registry, env, and scaffold honesty fields", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: true,
    });
    const lines = formatBetaIntegrationsIntegritySmokeReportLines(summary);
    expect(lines.some((line) => line.startsWith("overall: PASSED"))).toBe(true);
    expect(
      lines.some((line) =>
        line.includes(`registryBetaCount: ${BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT}/${BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT}`),
      ),
    ).toBe(true);
    expect(lines.some((line) => line.startsWith("scaffoldFailures: 0"))).toBe(true);
  });

  it("builds honest summary against real repo scaffold state", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: true,
    });
    expect(betaIntegrationsIntegritySmokeHonestScaffold(summary)).toBe(true);
    expect(BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "beta-integrations-integrity-smoke-integration-v1",
    );
  });
});
