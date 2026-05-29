import { describe, expect, it } from "vitest";

import {
  buildEra25FirstCharterSliceReadinessOrchestratorReportMarkdown,
  buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary,
  resolveEra25FirstCharterSliceReadinessMilestone,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";
import { evaluateEra25FirstCharterSliceReadinessWithMilestones } from "@/scripts/ops/validate-era25-first-charter-slice-readiness";

describe("era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24", () => {
  it("blocks when charter exit is not ready", () => {
    const result = evaluateEra25FirstCharterSliceReadinessWithMilestones({});
    expect(result.era25FirstCharterSliceReadinessMilestone).toBe("charter_exit_blocked");
  });

  it("resolves awaiting_signed_charter when no charter doc", () => {
    const milestone = resolveEra25FirstCharterSliceReadinessMilestone({
      era25CharterExitMilestone: "awaiting_signed_charter",
      signedCharterPresent: false,
      sectionsValid: false,
    });
    expect(milestone).toBe("awaiting_signed_charter");
  });

  it("resolves attention_charter_sections when doc incomplete", () => {
    const milestone = resolveEra25FirstCharterSliceReadinessMilestone({
      era25CharterExitMilestone: "era25_charter_exit_healthy",
      signedCharterPresent: true,
      sectionsValid: false,
    });
    expect(milestone).toBe("attention_charter_sections");
  });

  it("resolves era25_first_charter_slice_ready when sections valid", () => {
    const milestone = resolveEra25FirstCharterSliceReadinessMilestone({
      era25CharterExitMilestone: "era25_charter_exit_healthy",
      signedCharterPresent: true,
      sectionsValid: true,
    });
    expect(milestone).toBe("era25_first_charter_slice_ready");
  });

  it("builds orchestrator summary with charter exit redirect when blocked", () => {
    const evaluation = evaluateEra25FirstCharterSliceReadiness({});
    const summary = buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary({
      evaluation,
      era25CharterExitMilestone: "terminus_guard_blocked",
      artifacts: { readinessReportPresent: false },
    });
    expect(summary.milestone).toBe("charter_exit_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "era25-charter-exit-post-terminus-guard-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateEra25FirstCharterSliceReadiness({});
    const summary = buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary({
      evaluation,
      era25CharterExitMilestone: "terminus_guard_blocked",
      artifacts: { readinessReportPresent: false },
    });
    const markdown = buildEra25FirstCharterSliceReadinessOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 First Charter Slice — Readiness Orchestrator Report");
    expect(markdown).toContain("#era25-first-charter-slice-readiness");
  });
});
