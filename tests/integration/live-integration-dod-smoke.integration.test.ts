import { describe, expect, it } from "vitest";

import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
  LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_POLICY_ID,
  liveIntegrationDodSmokeHonestNoLiveClaim,
  liveIntegrationDodSmokePassContract,
  liveIntegrationDodSmokeWithinPassContract,
} from "@/lib/integrations/live-integration-dod-smoke-integration-policy";
import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import {
  buildLiveIntegrationDodSmokeSummary,
  formatLiveIntegrationDodSmokeReportLines,
  resolveLiveIntegrationDodSmokeOverall,
  resolveLiveIntegrationDodSmokeProofStatus,
} from "@/lib/integrations/live-integration-dod-smoke-summary";

/**
 * LIVE integration DoD smoke builder integration (QA-40).
 *
 * Cert chain + integrity + gate tracker → honest PASSED/FAILED artifact contract.
 *
 * @see scripts/smoke-live-integration-dod-era17.ts
 * @see lib/integrations/live-integration-dod-smoke-summary.ts
 */

describe("live integration dod smoke builder integration (QA-40)", () => {
  it("returns PASSED when cert chain and seven-row scaffold integrity succeed", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: true,
      envCertPassed: true,
      commitSha: "abc1234",
    });

    const contract = liveIntegrationDodSmokePassContract(summary);
    expect(liveIntegrationDodSmokeWithinPassContract(contract)).toBe(true);
    expect(liveIntegrationDodSmokeHonestNoLiveClaim(summary)).toBe(true);
    expect(summary.dod.scaffoldReadyCount).toBe(LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT);
    expect(summary.dod.total).toBe(LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT);
    expect(summary.g1g2ReadyCount).toBeGreaterThan(0);
  });

  it("returns FAILED with proof_failed_cert when cert chain fails", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: false,
      integrityCertPassed: false,
      envCertPassed: false,
    });

    expect(summary.overall).toBe("FAILED");
    expect(summary.proofStatus).toBe("proof_failed_cert");
    expect(liveIntegrationDodSmokeWithinPassContract(liveIntegrationDodSmokePassContract(summary))).toBe(
      false,
    );
    expect(liveIntegrationDodSmokeHonestNoLiveClaim(summary)).toBe(true);
  });

  it("returns FAILED with proof_failed_scaffold when integrity audit fails", () => {
    const proofStatus = resolveLiveIntegrationDodSmokeProofStatus({
      certPassed: true,
      integrityOverall: "FAILED",
      scaffoldReadyCount: 17,
    });
    expect(proofStatus).toBe("proof_failed_scaffold");
    expect(resolveLiveIntegrationDodSmokeOverall(proofStatus)).toBe("FAILED");

    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: false,
      envCertPassed: true,
    });
    expect(summary.overall).toBe("FAILED");
    expect(summary.integrityOverall).toBe("FAILED");
  });

  it("formats report lines with scaffold, env, and live honesty fields", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: true,
      envCertPassed: true,
    });
    const lines = formatLiveIntegrationDodSmokeReportLines(summary);
    expect(lines.some((line) => line.startsWith("overall: PASSED"))).toBe(true);
    expect(lines.some((line) => line.includes(`g1ScaffoldReady: ${LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT}/${LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT}`))).toBe(true);
    expect(lines.some((line) => line.startsWith(`liveCount: ${LIVE_INTEGRATION_REGISTRY_LIVE_COUNT}`))).toBe(true);
  });

  it("builds honest summary against real repo scaffold state", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: true,
      envCertPassed: true,
    });
    expect(summary.dod.scaffoldReadyCount).toBe(7);
    expect(liveIntegrationDodSmokeHonestNoLiveClaim(summary)).toBe(true);
    expect(LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "live-integration-dod-smoke-integration-v1",
    );
  });
});
