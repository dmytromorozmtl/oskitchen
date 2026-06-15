import { describe, expect, it } from "vitest";

import {
  buildCommercialGoClosurePostTier2OrchestratorSummary,
  buildCommercialGoClosureReadinessChecklistMarkdown,
  resolveCommercialGoClosureMilestone,
  resolveCommercialGoClosureMilestoneFromPhaseStatuses,
} from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import {
  buildCommercialGoClosurePhaseStatuses,
  resolveCommercialGoClosurePrerequisites,
} from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

describe("commercial-go-closure-post-tier2-orchestrator-era21", () => {
  it("blocks when tier2 prerequisites not met", () => {
    const evaluation = evaluateCommercialGoClosureEnv({});
    expect(evaluation.goClosureMilestone).toBe("tier2_blocked");
    expect(evaluation.prerequisites.prerequisitesComplete).toBe(false);
  });

  it("resolves awaiting_icp_qualification after prerequisites", () => {
    const prerequisites = resolveCommercialGoClosurePrerequisites({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    const phases = buildCommercialGoClosurePhaseStatuses({
      prerequisites,
      goNoGoSummary: null,
      env: {},
    });
    const milestone = resolveCommercialGoClosureMilestone({
      prerequisitesComplete: true,
      decision: null,
      phases,
    });
    expect(milestone).toBe("awaiting_icp_qualification");
  });

  it("builds orchestrator summary with tier2 redirect when blocked", () => {
    const evaluation = evaluateCommercialGoClosureEnv({});
    const summary = buildCommercialGoClosurePostTier2OrchestratorSummary({
      evaluation,
      goNoGoArtifactPresent: false,
    });
    expect(summary.milestone).toBe("tier2_blocked");
    expect(summary.recommendedCommands[0]).toContain("tier2-golden-path-post-p0-orchestrator");
  });

  it("builds readiness checklist markdown", () => {
    const evaluation = evaluateCommercialGoClosureEnv({});
    const summary = buildCommercialGoClosurePostTier2OrchestratorSummary({
      evaluation,
      goNoGoArtifactPresent: false,
    });
    const markdown = buildCommercialGoClosureReadinessChecklistMarkdown({ summary, evaluation });
    expect(markdown).toContain("Commercial GO Closure — Readiness Checklist");
    expect(markdown).toContain("launch-wizard");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveCommercialGoClosureMilestoneFromPhaseStatuses(
      [
        { id: "engineering_prerequisites", complete: true },
        { id: "icp_qualification", complete: true },
        { id: "sales_compliance", complete: false },
        { id: "loi_customer", complete: false },
        { id: "go_orchestrator", complete: false },
      ],
      { prerequisitesComplete: true, decision: "NO-GO" },
    );
    expect(milestone).toBe("awaiting_sales_compliance");
  });
});
