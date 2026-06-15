import { describe, expect, it } from "vitest";

import { buildSustainedProductEvolutionUiSlice } from "@/lib/commercial/sustained-product-evolution-ui-era23";
import {
  buildLaunchWizardProductEvolutionSlice,
  launchWizardProductEvolutionHref,
} from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";

describe("launch-wizard-product-evolution-era35", () => {
  it("builds slice when product evolution train active with integrity flags", () => {
    const productEvolution = buildSustainedProductEvolutionUiSlice({
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
      env: { SUSTAINED_PRODUCT_EVOLUTION_PRODUCT_LED_GROWTH_ATTESTED: "1" },
    });
    const slice = buildLaunchWizardProductEvolutionSlice(productEvolution);
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("tracks");
    expect(launchWizardProductEvolutionHref()).toContain("#launch-wizard-product-evolution");
  });
});
