import { describe, expect, it } from "vitest";

import {
  buildCommercialGateExecutionGates,
  buildCommercialGateExecutionSummary,
  resolveCommercialGateExecutionMilestone,
} from "@/lib/ops/commercial-gate-execution-orchestrator";

describe("commercial-gate-execution-orchestrator", () => {
  it("resolves tier2_execution_blocked before commercial phases", () => {
    expect(
      resolveCommercialGateExecutionMilestone({
        tier2ExecutionPassed: false,
        goClosureMilestone: "awaiting_icp_qualification",
        goDecision: "NO-GO",
        goIntegrityPassed: true,
        commercialInflectionMilestone: "pilot_gono_go_blocked",
      }),
    ).toBe("tier2_execution_blocked");
  });

  it("requires go integrity before commercial_gate_passed", () => {
    expect(
      resolveCommercialGateExecutionMilestone({
        tier2ExecutionPassed: true,
        goClosureMilestone: "decision_go",
        goDecision: "GO",
        goIntegrityPassed: false,
        commercialInflectionMilestone: "commercial_inflection_ready",
      }),
    ).toBe("awaiting_go_integrity");
  });

  it("resolves commercial_gate_passed only when GO + integrity + inflection ready", () => {
    expect(
      resolveCommercialGateExecutionMilestone({
        tier2ExecutionPassed: true,
        goClosureMilestone: "decision_go",
        goDecision: "GO",
        goIntegrityPassed: true,
        commercialInflectionMilestone: "commercial_inflection_ready",
      }),
    ).toBe("commercial_gate_passed");
  });

  it("never reports commercial_gate_passed when tier2 execution blocked", () => {
    const summary = buildCommercialGateExecutionSummary({
      tier2Execution: {
        version: "tier2-staging-proof-execution-v1",
        policyId: "era31-tier2-staging-proof-execution-v1",
        generatedAt: "2026-05-29T00:00:00.000Z",
        milestone: "p0_blocked",
        p0ProofStatus: "awaiting_ops_credentials",
        p0ExecutionMilestone: "vault_blocked",
        tier2ProofStatus: null,
        tier2Overall: null,
        tier2IntegrityPassed: true,
        p0IntegrityPassed: true,
        kdsPlaywrightProofStatus: null,
        goDecision: "NO-GO",
        goBlockerCount: 6,
        phases: [],
        gates: [],
        nextPhase: null,
        recommendedCommands: [],
        productSurfaces: [],
        honestyNote: "test",
      },
      goNoGo: {
        version: "era17-pilot-gono-go-v1",
        runAt: "2026-05-29T00:00:00.000Z",
        decision: "NO-GO",
        blockers: ["P0 not passed"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: false, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: false,
          tier1Pass: false,
          tier2Pass: false,
          tier3Pass: false,
          roleChecklistsComplete: false,
          forbiddenClaimsInContract: false,
          icpQualified: false,
          stagingUrl: null,
          commitSha: null,
        },
      },
    });
    expect(summary.milestone).toBe("tier2_execution_blocked");
    expect(summary.milestone).not.toBe("commercial_gate_passed");
    expect(summary.recommendedCommands.some((cmd) => cmd.includes("tier2-staging-proof-execution"))).toBe(
      true,
    );
  });

  it("builds seven execution gates with honest ICP detail", () => {
    const gates = buildCommercialGateExecutionGates({
      tier2ExecutionPassed: true,
      tier2ExecutionMilestone: "proof_passed",
      p0IntegrityPassed: true,
      tier2IntegrityPassed: true,
      icpArtifact: { envConfigured: false },
      goClosureReady: false,
      goDecision: "NO-GO",
      goIntegrityPassed: true,
      commercialInflectionMilestone: "pilot_gono_go_blocked",
    });
    expect(gates).toHaveLength(7);
    expect(gates.find((g) => g.id === "icp_qualification")?.complete).toBe(false);
    expect(gates.find((g) => g.id === "icp_qualification")?.label).toContain("F&B");
  });
});
