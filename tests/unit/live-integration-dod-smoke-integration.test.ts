import { describe, expect, it } from "vitest";

import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
  LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_POLICY_ID,
  liveIntegrationDodSmokeWithinPassContract,
} from "@/lib/integrations/live-integration-dod-smoke-integration-policy";
import { buildLiveIntegrationDodSmokeSummary } from "@/lib/integrations/live-integration-dod-smoke-summary";

describe("live integration dod smoke integration policy (QA-40)", () => {
  it("locks integration policy id and summary artifact path", () => {
    expect(LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_POLICY_ID).toBe(
      "live-integration-dod-smoke-integration-v1",
    );
    expect(LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT).toBe(
      "artifacts/smoke-live-integration-dod-summary.json",
    );
    expect(LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT).toBe(14);
  });

  it("evaluates pass contract for dod_audit_complete with zero LIVE", () => {
    const summary = buildLiveIntegrationDodSmokeSummary({
      certPassed: true,
      integrityCertPassed: true,
      envCertPassed: true,
    });
    expect(
      liveIntegrationDodSmokeWithinPassContract({
        overall: summary.overall,
        proofStatus: summary.proofStatus,
        scaffoldReadyCount: summary.dod.scaffoldReadyCount,
        expectedTotal: summary.dod.total,
        livePromotionCount: summary.livePromotionCount,
        integrityOverall: summary.integrityOverall,
      }),
    ).toBe(true);
  });
});
