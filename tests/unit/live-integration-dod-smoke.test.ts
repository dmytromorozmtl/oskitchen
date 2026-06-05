import { describe, expect, it } from "vitest";

import {
  buildLiveIntegrationDodSmokeSummary,
  resolveLiveIntegrationDodSmokeOverall,
  resolveLiveIntegrationDodSmokeProofStatus,
} from "@/lib/integrations/live-integration-dod-smoke-summary";

describe("live integration dod smoke summary", () => {
  it("passes when cert and scaffold integrity succeed", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: true,
      envCertPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("dod_audit_complete");
    expect(summary.dod.scaffoldReadyCount).toBe(15);
    expect(summary.dod.total).toBe(15);
  });

  it("fails when scaffold incomplete", () => {
    const proofStatus = resolveLiveIntegrationDodSmokeProofStatus({
      certPassed: true,
      integrityOverall: "FAILED",
      scaffoldReadyCount: 17,
    });
    expect(proofStatus).toBe("proof_failed_scaffold");
    expect(resolveLiveIntegrationDodSmokeOverall(proofStatus)).toBe("FAILED");
  });

  it("fails when cert chain fails", () => {
    const proofStatus = resolveLiveIntegrationDodSmokeProofStatus({
      certPassed: false,
      integrityOverall: "PASSED",
      scaffoldReadyCount: 18,
    });
    expect(proofStatus).toBe("proof_failed_cert");
  });
});
