import { describe, expect, it } from "vitest";

import {
  buildCostingPilotSpotcheckSummary,
  resolveCostingPilotSpotcheckProofStatus,
} from "@/lib/costing/costing-pilot-spotcheck-summary";

describe("costing pilot spotcheck summary", () => {
  it("resolves proof status from cert and operator attestation", () => {
    expect(
      resolveCostingPilotSpotcheckProofStatus({
        certPassed: false,
        fixtureSpotcheckPassed: true,
      }),
    ).toBe("proof_skipped_cert_failed");

    expect(
      resolveCostingPilotSpotcheckProofStatus({
        certPassed: true,
        fixtureSpotcheckPassed: true,
        operatorEmail: "ops@example.com",
      }),
    ).toBe("proof_passed");

    expect(
      resolveCostingPilotSpotcheckProofStatus({
        certPassed: true,
        fixtureSpotcheckPassed: true,
      }),
    ).toBe("spotcheck_documented_awaiting_staging_execution");
  });

  it("builds summary with fixture rows when cert passes", () => {
    const summary = buildCostingPilotSpotcheckSummary({ certPassed: true });
    expect(summary.fixtureRecipeCount).toBe(2);
    expect(summary.fixtureSpotcheckPassed).toBe(true);
    expect(summary.readinessDecision).toBe("READY");
    expect(summary.fixtureRows[0]?.recipeName).toBe("Pilot Chicken Bowl");
  });
});
