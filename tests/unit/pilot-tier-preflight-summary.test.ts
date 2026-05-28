import { describe, expect, it } from "vitest";

import {
  buildPilotTierPreflightSummary,
  resolvePilotTierPreflightOverall,
  resolvePilotTierProofStatus,
} from "@/lib/commercial/pilot-tier-preflight-summary";

describe("pilot tier preflight summary", () => {
  it("resolves tier proof passed when actionable steps pass", () => {
    const steps = [
      {
        id: "tier0_scorecard",
        tier: "tier0" as const,
        label: "Scorecard",
        status: "PASSED" as const,
      },
      {
        id: "tier0_governance",
        tier: "tier0" as const,
        label: "Governance",
        status: "SKIPPED" as const,
        reason: "local dev",
      },
    ];
    expect(resolvePilotTierProofStatus(steps, "tier0")).toBe("proof_passed");
  });

  it("marks overall failed when any step fails", () => {
    const steps = [
      {
        id: "tier1_claims",
        tier: "tier1" as const,
        label: "Claims",
        status: "FAILED" as const,
        reason: "exit 1",
      },
      {
        id: "tier1_staging",
        tier: "tier1" as const,
        label: "Staging",
        status: "SKIPPED" as const,
        reason: "missing env",
      },
    ];
    expect(resolvePilotTierPreflightOverall(steps)).toBe("FAILED");
    expect(resolvePilotTierProofStatus(steps, "tier1")).toBe("proof_failed");
  });

  it("builds summary with commit sha and strict claims flag", () => {
    const summary = buildPilotTierPreflightSummary(
      [
        {
          id: "tier1_claims",
          tier: "tier1",
          label: "Claims strict",
          status: "PASSED",
        },
      ],
      { commitSha: "abc123", marketingClaimsStrict: true },
      new Date("2026-05-28T12:00:00.000Z"),
    );
    expect(summary.commitSha).toBe("abc123");
    expect(summary.marketingClaimsStrict).toBe(true);
    expect(summary.tier1ProofStatus).toBe("proof_passed");
    expect(summary.tier0ProofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(summary.overall).toBe("SKIPPED");
  });

  it("marks overall passed only when both tiers proof_passed", () => {
    const summary = buildPilotTierPreflightSummary([
      { id: "tier0_gov", tier: "tier0", label: "Governance", status: "PASSED" },
      { id: "tier1_claims", tier: "tier1", label: "Claims", status: "PASSED" },
    ]);
    expect(summary.tier0ProofStatus).toBe("proof_passed");
    expect(summary.tier1ProofStatus).toBe("proof_passed");
    expect(summary.overall).toBe("PASSED");
  });
});
