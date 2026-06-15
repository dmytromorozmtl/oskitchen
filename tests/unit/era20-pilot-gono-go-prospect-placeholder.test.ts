import { describe, expect, it } from "vitest";

import { buildPilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";

describe("era20 pilot gono-go prospect placeholder", () => {
  it("adds warning for prospect without removing customer blocker", () => {
    const summary = buildPilotGoNoGoSummary({
      preflight: {
        overall: "SKIPPED",
        tier0ProofStatus: "proof_skipped_missing_prerequisites",
        tier1ProofStatus: "proof_skipped_missing_prerequisites",
      },
      goldenPath: { phaseProofStatus: "proof_skipped_missing_prerequisites" },
      forbiddenClaimsEnforcement: null,
      p0StagingProof: {
        overall: "SKIPPED",
        p0ProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: ["E2E_STAGING_BASE_URL"],
      },
      ssoPilotReadyGate: null,
      icpInput: {},
      prospectName: "Acme Commissary (prospect)",
    });

    expect(summary.decision).toBe("NO-GO");
    expect(summary.prospectExecutionStatus).toBe("prospect_placeholder");
    expect(summary.prospectName).toBe("Acme Commissary (prospect)");
    expect(summary.customerExecutionStatus).toBe("skipped_missing_customer");
    expect(
      summary.warnings.some((item) => item.includes("Prospect placeholder")),
    ).toBe(true);
    expect(summary.blockers.some((item) => item.includes("LOI"))).toBe(true);
  });
});
