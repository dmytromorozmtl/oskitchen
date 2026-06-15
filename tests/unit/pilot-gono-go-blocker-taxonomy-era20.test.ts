import { describe, expect, it } from "vitest";

import {
  buildPilotGoNoGoBlockerTaxonomy,
  categorizePilotGoNoGoBlocker,
} from "@/lib/commercial/pilot-gono-go-blocker-taxonomy-era20";
import { buildPilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

describe("pilot gono-go blocker taxonomy era20", () => {
  it("categorizes P0 blocker as ops_credential", () => {
    const item = categorizePilotGoNoGoBlocker(
      "P0 staging proof not passed (era17-p0-staging-proof-unblock-v1)",
    );
    expect(item.category).toBe("ops_credential");
    expect(item.owner).toBe("ops");
  });

  it("embeds taxonomy on summary and clears false tier0 blocker when tier0 passed", () => {
    const summary = buildPilotGoNoGoSummary({
      preflight: {
        overall: "SKIPPED",
        tier0ProofStatus: "proof_passed",
        tier1ProofStatus: "proof_skipped_missing_prerequisites",
      },
      goldenPath: { phaseProofStatus: "proof_skipped_missing_prerequisites" },
      forbiddenClaimsEnforcement: { claimsEnforcementProofStatus: "proof_passed" },
      p0StagingProof: {
        p0ProofStatus: "awaiting_ops_credentials",
        overall: "SKIPPED",
      },
      ssoPilotReadyGate: null,
      icpInput: {},
    });

    expect(summary.blockerTaxonomy?.categorizedBlockers.length).toBeGreaterThan(0);
    expect(
      summary.blockers.some((item) => item.includes("Tier 0 engineering CI gate failed")),
    ).toBe(false);
    expect(
      summary.blockers.some((item) => item.includes("Tier 1 staging")),
    ).toBe(true);

    expect(summary.evidenceGates.find((gate) => gate.id === "tier0")?.pass).toBe(true);
  });
});
