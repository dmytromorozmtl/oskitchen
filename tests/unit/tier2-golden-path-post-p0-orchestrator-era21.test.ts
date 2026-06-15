import { describe, expect, it } from "vitest";

import {
  buildTier2GoldenPathPostP0OrchestratorSummary,
  buildTier2GoldenPathReadinessChecklistMarkdown,
  resolveTier2GoldenPathMilestone,
  resolveTier2GoldenPathMilestoneFromPhaseStatuses,
} from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import { buildTier2GoldenPathPhaseStatuses } from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

describe("tier2-golden-path-post-p0-orchestrator-era21", () => {
  it("reflects P0 gate from staging artifact when env is empty", () => {
    const evaluation = evaluateTier2GoldenPathEnv({});
    expect(evaluation.p0GatePassed).toBe(true);
    expect(evaluation.tier2Milestone).not.toBe("p0_blocked");
  });

  it("resolves awaiting_child_smokes when P0 passed but no child smokes", () => {
    const phases = buildTier2GoldenPathPhaseStatuses({ tier2Summary: null });
    const milestone = resolveTier2GoldenPathMilestone({
      p0GatePassed: true,
      tier2GatePassed: false,
      phases,
    });
    expect(milestone).toBe("awaiting_child_smokes");
  });

  it("builds orchestrator summary with recommended commands", () => {
    const evaluation = evaluateTier2GoldenPathEnv({});
    const summary = buildTier2GoldenPathPostP0OrchestratorSummary({
      evaluation,
      artifactPresent: false,
    });
    expect(summary.policyId).toBe("era21-tier2-golden-path-post-p0-orchestrator-v1");
    expect(summary.recommendedCommands[0]).toContain("p0-staging-proof");
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateTier2GoldenPathEnv({});
    const summary = buildTier2GoldenPathPostP0OrchestratorSummary({
      evaluation,
      artifactPresent: false,
    });
    const markdown = buildTier2GoldenPathReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Tier 2 Golden Path — Readiness Checklist");
    expect(markdown).toContain("launch-wizard");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveTier2GoldenPathMilestoneFromPhaseStatuses(
      [
        { id: "automated_child_smokes", complete: true },
        { id: "manual_fulfillment", complete: false },
        { id: "github_kds_evidence", complete: false },
        { id: "operator_metadata", complete: false },
      ],
      { p0GatePassed: true, tier2GatePassed: false },
    );
    expect(milestone).toBe("awaiting_manual_fulfillment");
  });
});
