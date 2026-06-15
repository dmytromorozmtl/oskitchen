import { describe, expect, it } from "vitest";

import {
  buildEra25EngineeringGatesOrchestratorReportMarkdown,
  buildEra25EngineeringGatesPostReadinessOrchestratorSummary,
  resolveEra25EngineeringGatesMilestone,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";
import { evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones } from "@/scripts/ops/validate-era25-engineering-gates-require-signed-charter";

describe("era25-engineering-gates-post-readiness-orchestrator-era24", () => {
  it("blocks when charter readiness is not healthy", () => {
    const result = evaluateEra25EngineeringGatesRequireSignedCharterWithMilestones({});
    expect(result.era25EngineeringGatesMilestone).toBe("charter_readiness_blocked");
  });

  it("resolves awaiting_human_charter_signoff when readiness not ready", () => {
    const milestone = resolveEra25EngineeringGatesMilestone({
      era25FirstCharterSliceReadinessMilestone: "awaiting_signed_charter",
      illegalArtifactCount: 0,
    });
    expect(milestone).toBe("awaiting_human_charter_signoff");
  });

  it("resolves attention_illegal_era25_artifacts when product files exist", () => {
    const milestone = resolveEra25EngineeringGatesMilestone({
      era25FirstCharterSliceReadinessMilestone: "era25_first_charter_slice_ready",
      illegalArtifactCount: 1,
    });
    expect(milestone).toBe("attention_illegal_era25_artifacts");
  });

  it("resolves era25_engineering_gates_open when ready and clean", () => {
    const milestone = resolveEra25EngineeringGatesMilestone({
      era25FirstCharterSliceReadinessMilestone: "era25_first_charter_slice_ready",
      illegalArtifactCount: 0,
    });
    expect(milestone).toBe("era25_engineering_gates_open");
  });

  it("builds orchestrator summary with readiness redirect when blocked", () => {
    const evaluation = evaluateEra25EngineeringGatesRequireSignedCharter({});
    const summary = buildEra25EngineeringGatesPostReadinessOrchestratorSummary({
      evaluation,
      artifacts: { gatesReportPresent: false },
    });
    expect(summary.milestone).toBe("charter_readiness_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "era25-first-charter-slice-readiness-post-charter-exit-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateEra25EngineeringGatesRequireSignedCharter({});
    const summary = buildEra25EngineeringGatesPostReadinessOrchestratorSummary({
      evaluation,
      artifacts: { gatesReportPresent: false },
    });
    const markdown = buildEra25EngineeringGatesOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Engineering Gates — Orchestrator Report");
    expect(markdown).toContain("#era25-engineering-gates-require-signed-charter");
  });
});
