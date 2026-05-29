import { describe, expect, it } from "vitest";

import { evaluateTier2StagingGoldenPathIntegrity } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";
import {
  recomputeTier2ProofStatusFromSummary,
  type Tier2StagingGoldenPathSummary,
} from "@/lib/commercial/tier2-staging-golden-path-summary";

function fakePassedTier2Summary(): Tier2StagingGoldenPathSummary {
  return {
    version: "era20-tier2-staging-golden-path-v1",
    runAt: "2026-05-28T00:00:00.000Z",
    commitSha: null,
    overall: "SKIPPED",
    tier2ProofStatus: "proof_passed",
    p0ProofStatus: "proof_passed",
    steps: [
      {
        id: "p0_gate",
        label: "P0 gate",
        kind: "p0_gate",
        status: "PASSED",
        reason: "proof_passed",
      },
      {
        id: "tier2_channel_webhook",
        label: "Channel webhook",
        kind: "manual_phase",
        status: "SKIPPED",
        reason: "TIER2_CHANNEL_WEBHOOK_MANUAL unset",
      },
      {
        id: "tier2_kds_bump",
        label: "KDS bump",
        kind: "manual_phase",
        status: "SKIPPED",
        reason: "TIER2_KDS_BUMP_MANUAL unset",
      },
      {
        id: "tier2_packing_complete",
        label: "Packing complete",
        kind: "manual_phase",
        status: "SKIPPED",
        reason: "TIER2_PACKING_COMPLETE_MANUAL unset",
      },
      {
        id: "github_kds_staging",
        label: "GitHub KDS staging",
        kind: "github_evidence",
        status: "SKIPPED",
        reason: "GITHUB_KDS_STAGING_RUN_URL unset",
      },
    ],
    missingManualEnvVars: [
      "TIER2_CHANNEL_WEBHOOK_MANUAL",
      "TIER2_KDS_BUMP_MANUAL",
      "TIER2_PACKING_COMPLETE_MANUAL",
    ],
    playbookDoc: "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
  };
}

describe("tier2-staging-golden-path-integrity-era28", () => {
  it("detects fake proof_passed when manual steps are SKIPPED", () => {
    const summary = fakePassedTier2Summary();
    expect(recomputeTier2ProofStatusFromSummary(summary)).toBe("awaiting_manual_phases");

    const result = evaluateTier2StagingGoldenPathIntegrity(process.cwd(), {
      artifactOverride: summary,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.violations.some((row) => row.id === "fake_pass_status_mismatch")).toBe(true);
    expect(result.violations.some((row) => row.id === "fake_pass_overall_skipped")).toBe(true);
  });

  it("detects tier2 proof_passed without live P0 proof_passed", () => {
    const summary = fakePassedTier2Summary();
    const result = evaluateTier2StagingGoldenPathIntegrity(process.cwd(), {
      artifactOverride: summary,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.violations.some((row) => row.id === "p0_prerequisite_not_passed")).toBe(true);
  });

  it("passes when artifact missing (awaiting orchestrator)", () => {
    const result = evaluateTier2StagingGoldenPathIntegrity(process.cwd(), {
      artifactOverride: null,
    });
    expect(result.integrityPassed).toBe(true);
    expect(result.violations.some((row) => row.id === "artifact_missing")).toBe(true);
  });
});
