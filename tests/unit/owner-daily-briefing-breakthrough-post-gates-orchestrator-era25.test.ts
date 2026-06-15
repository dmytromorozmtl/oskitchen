import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingBreakthroughEra25OrchestratorReportMarkdown,
  buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary,
  resolveOwnerDailyBriefingBreakthroughEra25Milestone,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones } from "@/scripts/ops/validate-owner-daily-briefing-breakthrough-era25";

describe("owner-daily-briefing-breakthrough-post-gates-orchestrator-era25", () => {
  it("blocks when blueprint is not ready", () => {
    const result = evaluateOwnerDailyBriefingBreakthroughEra25WithMilestones({});
    expect(result.ownerDailyBriefingBreakthroughEra25Milestone).toBe(
      "blueprint_regression_blocked",
    );
  });

  it("resolves awaiting_staging_proof when blueprint ready but p0 blocked", () => {
    const milestone = resolveOwnerDailyBriefingBreakthroughEra25Milestone({
      era25FirstProductSliceBlueprintMilestone: "era25_first_product_slice_blueprint_ready",
      allBriefingTilesWired: true,
      p0ProofStatus: "awaiting_ops_credentials",
    });
    expect(milestone).toBe("awaiting_staging_proof");
  });

  it("resolves owner_daily_briefing_breakthrough_era25_ready when all pass", () => {
    const milestone = resolveOwnerDailyBriefingBreakthroughEra25Milestone({
      era25FirstProductSliceBlueprintMilestone: "era25_first_product_slice_blueprint_ready",
      allBriefingTilesWired: true,
      p0ProofStatus: "proof_passed",
    });
    expect(milestone).toBe("owner_daily_briefing_breakthrough_era25_ready");
  });

  it("builds orchestrator summary with blueprint redirect when blocked", () => {
    const evaluation = evaluateOwnerDailyBriefingBreakthroughEra25({});
    const summary = buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary({
      evaluation,
      artifacts: { productReportPresent: false },
    });
    expect(summary.milestone).toBe("blueprint_regression_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "era25-first-product-slice-blueprint-post-gates-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateOwnerDailyBriefingBreakthroughEra25({});
    const summary = buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary({
      evaluation,
      artifacts: { productReportPresent: false },
    });
    const markdown = buildOwnerDailyBriefingBreakthroughEra25OrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 Owner Daily Briefing Breakthrough — Orchestrator Report");
    expect(markdown).toContain("#era25-owner-daily-briefing-breakthrough");
  });
});
