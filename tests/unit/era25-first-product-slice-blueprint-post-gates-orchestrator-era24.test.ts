import { describe, expect, it } from "vitest";

import {
  buildEra25FirstProductSliceBlueprintOrchestratorReportMarkdown,
  buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary,
  resolveEra25FirstProductSliceBlueprintMilestone,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";
import { evaluateEra25FirstProductSliceBlueprintWithMilestones } from "@/scripts/ops/validate-era25-first-product-slice-blueprint";

describe("era25-first-product-slice-blueprint-post-gates-orchestrator-era24", () => {
  it("blocks when engineering gates are not open", () => {
    const result = evaluateEra25FirstProductSliceBlueprintWithMilestones({});
    expect(result.era25FirstProductSliceBlueprintMilestone).toBe("engineering_gates_blocked");
  });

  it("resolves awaiting_canonical_charter_doc when gates open but no charter", () => {
    const milestone = resolveEra25FirstProductSliceBlueprintMilestone({
      era25EngineeringGatesMilestone: "era25_engineering_gates_open",
      gatesBlocked: false,
      illegalArtifactCount: 0,
      canonicalCharterDocPath: null,
      charterSectionsValid: false,
      stagingChecklistSectionsValid: true,
    });
    expect(milestone).toBe("awaiting_canonical_charter_doc");
  });

  it("resolves era25_first_product_slice_blueprint_ready when all criteria met", () => {
    const milestone = resolveEra25FirstProductSliceBlueprintMilestone({
      era25EngineeringGatesMilestone: "era25_engineering_gates_open",
      gatesBlocked: false,
      illegalArtifactCount: 0,
      canonicalCharterDocPath: "docs/era25-owner-daily-briefing-breakthrough-charter-2026-05-28.md",
      charterSectionsValid: true,
      stagingChecklistSectionsValid: true,
    });
    expect(milestone).toBe("era25_first_product_slice_blueprint_ready");
  });

  it("builds orchestrator summary with gates redirect when blocked", () => {
    const evaluation = evaluateEra25FirstProductSliceBlueprint({});
    const summary = buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary({
      evaluation,
      artifacts: { blueprintReportPresent: false },
    });
    expect(summary.milestone).toBe("engineering_gates_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "era25-engineering-gates-post-readiness-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateEra25FirstProductSliceBlueprint({});
    const summary = buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary({
      evaluation,
      artifacts: { blueprintReportPresent: false },
    });
    const markdown = buildEra25FirstProductSliceBlueprintOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("era25 First Product Slice Blueprint — Orchestrator Report");
    expect(markdown).toContain("#era25-first-product-slice-blueprint");
  });
});
