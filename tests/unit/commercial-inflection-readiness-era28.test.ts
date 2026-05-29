import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  evaluateCommercialInflectionReadiness,
  resolveCommercialInflectionMilestone,
} from "@/lib/commercial/commercial-inflection-readiness-era28";

describe("commercial-inflection-readiness-era28", () => {
  it("locks policy id", () => {
    expect(COMMERCIAL_INFLECTION_READINESS_POLICY_ID).toBe("commercial-inflection-readiness-v1");
  });

  it("reports honest p0_ops_vault_blocked locally", () => {
    const result = evaluateCommercialInflectionReadiness({});
    expect(result.milestone).toBe("p0_ops_vault_blocked");
    expect(result.p0ProofStatus).toBe("awaiting_ops_credentials");
    expect(result.p0VaultMissingCount).toBe(11);
    expect(result.goDecision).not.toBe("GO");
    expect(result.blockers.some((row) => row.id === "stop_skipped_as_pass")).toBe(true);
    const stopRule = result.blockers.find((row) => row.id === "stop_skipped_as_pass");
    expect(stopRule?.validateCommand).toContain("validate-p0-staging-proof-integrity");
  });

  it("orders milestones after vault before proof", () => {
    expect(
      resolveCommercialInflectionMilestone({
        p0VaultAllPresent: true,
        p0ProofPassed: false,
        tier2ProofPassed: false,
        goDecision: "NO-GO",
        blockedP0Count: 3,
      }),
    ).toBe("p0_staging_proof_blocked");
  });
});
