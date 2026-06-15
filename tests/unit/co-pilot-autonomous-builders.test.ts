import { describe, expect, it } from "vitest";

import type { CoPilotRecommendation } from "@/lib/ai/co-pilot-types";
import {
  buildDailyDigest,
  buildExceptionLogFromRecommendations,
  isAutoSafeRecommendation,
} from "@/lib/ai/co-pilot-autonomous-builders";

function rec(partial: Partial<CoPilotRecommendation> & Pick<CoPilotRecommendation, "id">): CoPilotRecommendation {
  return {
    category: "procurement",
    severity: "info",
    title: "Test",
    summary: "Summary",
    impactLabel: "Low",
    suggestedAction: "Act",
    actionType: "suggest_report_export",
    payload: {},
    actionRoute: "/dashboard",
    ...partial,
  };
}

describe("co-pilot autonomous builders", () => {
  it("identifies safe info recommendations", () => {
    expect(isAutoSafeRecommendation(rec({ id: "a", actionType: "suggest_report_export" }))).toBe(true);
    expect(
      isAutoSafeRecommendation(rec({ id: "b", severity: "critical", actionType: "suggest_report_export" })),
    ).toBe(false);
  });

  it("builds digest with critical headline", () => {
    const digest = buildDailyDigest({
      recommendations: [
        rec({ id: "c", severity: "critical", category: "pricing" }),
        rec({ id: "w", severity: "warning" }),
      ],
      pendingApproval: 2,
      autoExecuted: 1,
      exceptionsLogged: 3,
    });
    expect(digest.stats.criticalCount).toBe(1);
    expect(digest.headline).toContain("critical");
    expect(digest.sections).toHaveLength(4);
  });

  it("merges exceptions from non-info recommendations", () => {
    const log = buildExceptionLogFromRecommendations(
      [rec({ id: "x", severity: "warning", title: "Low stock" })],
      [],
    );
    expect(log).toHaveLength(1);
    expect(log[0]?.title).toBe("Low stock");
  });
});
