import { describe, expect, it } from "vitest";

import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildTier2StagingProofExecutionGates,
  buildTier2StagingProofExecutionSummary,
  readKdsPlaywrightProofStatus,
  resolveTier2StagingProofExecutionMilestone,
} from "@/lib/ops/tier2-staging-proof-execution-orchestrator";

const baseTier2Summary: Tier2StagingGoldenPathSummary = {
  version: "era20-tier2-staging-golden-path-v1",
  runAt: "2026-05-29T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  tier2ProofStatus: "awaiting_p0_proof_passed",
  p0ProofStatus: "awaiting_ops_credentials",
  steps: [],
  missingManualEnvVars: [
    "TIER2_CHANNEL_WEBHOOK_MANUAL",
    "TIER2_KDS_BUMP_MANUAL",
    "TIER2_PACKING_COMPLETE_MANUAL",
  ],
  playbookDoc: "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
};

describe("tier2-staging-proof-execution-orchestrator", () => {
  it("reads kds playwright proof status from artifact fields", () => {
    expect(readKdsPlaywrightProofStatus({ playwrightProofStatus: "proof_passed" })).toBe(
      "proof_passed",
    );
    expect(readKdsPlaywrightProofStatus({ overall: "PASSED" })).toBe("PASSED");
    expect(readKdsPlaywrightProofStatus(null)).toBeNull();
  });

  it("resolves p0_blocked before tier2 milestones", () => {
    expect(
      resolveTier2StagingProofExecutionMilestone({
        p0GatePassed: false,
        p0ExecutionPassed: false,
        tier2Milestone: "awaiting_child_smokes",
        tier2GatePassed: false,
        tier2IntegrityPassed: true,
      }),
    ).toBe("p0_blocked");
  });

  it("resolves proof_passed only when tier2 gate and integrity pass", () => {
    expect(
      resolveTier2StagingProofExecutionMilestone({
        p0GatePassed: true,
        p0ExecutionPassed: true,
        tier2Milestone: "proof_passed",
        tier2GatePassed: true,
        tier2IntegrityPassed: true,
      }),
    ).toBe("proof_passed");
  });

  it("requires tier2 integrity after tier2 proof_passed", () => {
    expect(
      resolveTier2StagingProofExecutionMilestone({
        p0GatePassed: true,
        p0ExecutionPassed: true,
        tier2Milestone: "proof_passed",
        tier2GatePassed: true,
        tier2IntegrityPassed: false,
      }),
    ).toBe("awaiting_tier2_integrity");
  });

  it("never reports proof_passed when p0 gate is blocked", () => {
    const summary = buildTier2StagingProofExecutionSummary({
      tier2Summary: baseTier2Summary,
      p0Execution: {
        version: "p0-staging-proof-execution-v1",
        policyId: "era30-p0-staging-proof-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "vault_blocked",
        vaultReady: false,
        p0ProofStatus: "awaiting_ops_credentials",
        p0Overall: "SKIPPED",
        integrityPassed: true,
        stagingHealth: {
          checked: false,
          ok: false,
          url: null,
          statusCode: null,
          error: "E2E_STAGING_BASE_URL not set",
        },
        phases: [],
        nextPhase: null,
        recommendedCommands: [],
        honestyNote: "test",
      },
      env: {},
    });
    expect(summary.milestone).toBe("p0_blocked");
    expect(summary.milestone).not.toBe("proof_passed");
    expect(summary.recommendedCommands.some((cmd) => cmd.includes("p0-staging-proof-execution"))).toBe(
      true,
    );
  });

  it("builds five execution gates with honest kds detail", () => {
    const gates = buildTier2StagingProofExecutionGates({
      p0GatePassed: true,
      p0ExecutionPassed: false,
      p0IntegrityPassed: true,
      tier2IntegrityPassed: true,
      kdsProofStatus: null,
    });
    expect(gates).toHaveLength(5);
    expect(gates.find((g) => g.id === "kds_playwright")?.complete).toBe(false);
    expect(gates.find((g) => g.id === "p0_execution")?.complete).toBe(false);
  });
});
