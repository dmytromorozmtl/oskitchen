import { describe, expect, it } from "vitest";

import {
  resolveTodayMetricsExpandHref,
  shouldCollapseTodayMetricsForBriefing,
  shouldCompactTodayReadinessForBriefing,
  shouldHideTodayAttentionStripForBriefing,
  todayMetricsExpandLabel,
  OWNER_DAILY_BRIEFING_TODAY_FOCUS_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-today-focus-era19";

describe("owner daily briefing today focus era19", () => {
  it("locks era19 today focus policy id", () => {
    expect(OWNER_DAILY_BRIEFING_TODAY_FOCUS_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-today-focus-v1",
    );
  });

  it("collapses KPI wall when briefing is active unless metrics=all", () => {
    expect(
      shouldCollapseTodayMetricsForBriefing({ briefingActive: true, showFullMetrics: false }),
    ).toBe(true);
    expect(
      shouldCollapseTodayMetricsForBriefing({ briefingActive: true, showFullMetrics: true }),
    ).toBe(false);
    expect(
      shouldCollapseTodayMetricsForBriefing({ briefingActive: false, showFullMetrics: false }),
    ).toBe(false);
  });

  it("hides duplicate attention strip when briefing is active", () => {
    expect(shouldHideTodayAttentionStripForBriefing(true)).toBe(true);
    expect(shouldHideTodayAttentionStripForBriefing(false)).toBe(false);
  });

  it("compacts readiness card when briefing is active", () => {
    expect(
      shouldCompactTodayReadinessForBriefing({ briefingActive: true, showFullMetrics: false }),
    ).toBe(true);
    expect(
      shouldCompactTodayReadinessForBriefing({ briefingActive: true, showFullMetrics: true }),
    ).toBe(false);
  });

  it("resolves metrics expand toggle href and label", () => {
    expect(resolveTodayMetricsExpandHref(false)).toBe("/dashboard/today?metrics=all");
    expect(resolveTodayMetricsExpandHref(true)).toBe("/dashboard/today");
    expect(todayMetricsExpandLabel(false)).toBe("View full metrics");
    expect(todayMetricsExpandLabel(true)).toBe("Hide full metrics");
  });
});
