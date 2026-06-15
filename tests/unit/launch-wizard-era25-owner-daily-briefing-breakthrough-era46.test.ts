import { describe, expect, it } from "vitest";

import { buildEra25FirstProductSliceBlueprintUiSlice } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import {
  buildLaunchWizardEra25OwnerDailyBriefingBreakthroughSlice,
  launchWizardEra25OwnerDailyBriefingBreakthroughHref,
} from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";

describe("launch-wizard-era25-owner-daily-briefing-breakthrough-era46", () => {
  it("builds slice when breakthrough train active with integrity flags", () => {
    const blueprint = buildEra25FirstProductSliceBlueprintUiSlice({
      engineeringGatesVisible: true,
      env: { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED: "1" },
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: true,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: false,
          icpQualified: true,
          stagingUrl: "https://x.example.com",
          commitSha: "abc",
        },
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    const breakthrough = blueprint?.ownerDailyBriefingBreakthrough ?? null;
    const slice = buildLaunchWizardEra25OwnerDailyBriefingBreakthroughSlice(breakthrough, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.ownerDailyBriefingBreakthroughIntegrityFailed).toBe(true);
    expect(launchWizardEra25OwnerDailyBriefingBreakthroughHref()).toContain(
      "#launch-wizard-era25-owner-daily-briefing-breakthrough",
    );
  });
});
