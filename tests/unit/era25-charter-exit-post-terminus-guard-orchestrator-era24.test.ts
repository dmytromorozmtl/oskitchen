import { describe, expect, it } from "vitest";

import {
  buildEra25CharterExitOrchestratorReportMarkdown,
  buildEra25CharterExitPostTerminusGuardOrchestratorSummary,
  resolveEra25CharterExitMilestone,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";

describe("era25-charter-exit-post-terminus-guard-orchestrator-era24", () => {
  it("blocks when terminus guard is not healthy", () => {
    const result = evaluateEra25CharterExitOutsideLinearPathWithMilestones({});
    expect(result.era25CharterExitMilestone).toBe("terminus_guard_blocked");
  });

  it("resolves attention_charter_checklist when checklist missing", () => {
    const milestone = resolveEra25CharterExitMilestone({
      linearChainTerminusGuardMilestone: "step17_forbidden_healthy",
      guardPassed: true,
      charterChecklistPresent: false,
      signedCharterPresent: false,
    });
    expect(milestone).toBe("attention_charter_checklist");
  });

  it("resolves awaiting_signed_charter when checklist present but no charter doc", () => {
    const milestone = resolveEra25CharterExitMilestone({
      linearChainTerminusGuardMilestone: "step17_forbidden_healthy",
      guardPassed: true,
      charterChecklistPresent: true,
      signedCharterPresent: false,
    });
    expect(milestone).toBe("awaiting_signed_charter");
  });

  it("resolves era25_charter_exit_healthy when signed charter present", () => {
    const milestone = resolveEra25CharterExitMilestone({
      linearChainTerminusGuardMilestone: "step17_forbidden_healthy",
      guardPassed: true,
      charterChecklistPresent: true,
      signedCharterPresent: true,
    });
    expect(milestone).toBe("era25_charter_exit_healthy");
  });

  it("builds orchestrator summary with Step 17 redirect when blocked", () => {
    const evaluation = evaluateEra25CharterExitOutsideLinearPath({});
    const summary = buildEra25CharterExitPostTerminusGuardOrchestratorSummary({
      evaluation,
      artifacts: { era25CharterExitReportPresent: false },
    });
    expect(summary.milestone).toBe("terminus_guard_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "linear-chain-terminus-guard-post-linear-path-closed-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateEra25CharterExitOutsideLinearPath({});
    const summary = buildEra25CharterExitPostTerminusGuardOrchestratorSummary({
      evaluation,
      artifacts: { era25CharterExitReportPresent: false },
    });
    const markdown = buildEra25CharterExitOrchestratorReportMarkdown({ summary, evaluation });
    expect(markdown).toContain("era25+ Charter Exit — Orchestrator Report");
    expect(markdown).toContain("#era25-charter-exit-outside-linear-path");
    expect(markdown).toContain("NOT Step 18");
  });
});
