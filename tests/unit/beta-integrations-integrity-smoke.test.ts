import { describe, expect, it } from "vitest";

import {
  buildBetaIntegrationsIntegritySmokeSummary,
  resolveBetaIntegrationsIntegrityOverall,
  resolveBetaIntegrationsIntegrityProofStatus,
} from "@/lib/integrations/beta-integrations-integrity-smoke-summary";

describe("beta integrations integrity smoke summary", () => {
  it("passes when both cert chains and sub-audits succeed", () => {
    const summary = buildBetaIntegrationsIntegritySmokeSummary({
      registryCertPassed: true,
      envCertPassed: true,
      strictEnvMode: false,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("integrity_complete");
    expect(summary.registry.registryBetaCount).toBe(16);
    expect(summary.env.envSummary.total).toBe(16);
  });

  it("fails when registry cert fails", () => {
    const proofStatus = resolveBetaIntegrationsIntegrityProofStatus({
      registryCertPassed: false,
      envCertPassed: true,
      registryOverall: "FAILED",
      envOverall: "PASSED",
    });
    expect(proofStatus).toBe("cert_failed");
    expect(resolveBetaIntegrationsIntegrityOverall(proofStatus)).toBe("FAILED");
  });

  it("fails when env sub-audit fails under strict mode", () => {
    const proofStatus = resolveBetaIntegrationsIntegrityProofStatus({
      registryCertPassed: true,
      envCertPassed: true,
      registryOverall: "PASSED",
      envOverall: "FAILED",
    });
    expect(proofStatus).toBe("env_failed");
    expect(resolveBetaIntegrationsIntegrityOverall(proofStatus)).toBe("FAILED");
  });
});
