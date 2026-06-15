import { describe, expect, it } from "vitest";

import { buildEra25EngineeringGatesUiSlice } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import {
  buildLaunchWizardEra25FirstProductSliceBlueprintSlice,
  launchWizardEra25FirstProductSliceBlueprintHref,
} from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";

describe("launch-wizard-era25-first-product-slice-blueprint-era45", () => {
  it("builds slice when blueprint train active with integrity flags", () => {
    const gates = buildEra25EngineeringGatesUiSlice({
      readinessVisible: true,
      env: { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED: "1" },
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
    const blueprint = gates?.firstProductSliceBlueprint ?? null;
    const slice = buildLaunchWizardEra25FirstProductSliceBlueprintSlice(blueprint, "Acme");
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("attention");
    expect(slice!.era25FirstProductSliceBlueprintIntegrityFailed).toBe(true);
    expect(launchWizardEra25FirstProductSliceBlueprintHref()).toContain(
      "#launch-wizard-era25-first-product-slice-blueprint",
    );
  });
});
