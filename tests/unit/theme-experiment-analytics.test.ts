import { describe, expect, it } from "vitest";

import {
  accumulateExperimentFunnelEvent,
  buildExperimentDateKeys,
  conversionRatePercent,
  experimentDailyChartRowsFromBuckets,
  initExperimentDailyBuckets,
  parseExperimentArmFromMetadata,
  sumExperimentArmCounts,
} from "@/lib/storefront/theme-experiment-analytics-core";

describe("parseExperimentArmFromMetadata", () => {
  it("returns arm when present", () => {
    expect(parseExperimentArmFromMetadata({ experimentArm: "draft" })).toBe("draft");
    expect(parseExperimentArmFromMetadata({ experimentArm: "published" })).toBe("published");
  });

  it("returns null for missing or invalid arm", () => {
    expect(parseExperimentArmFromMetadata(null)).toBeNull();
    expect(parseExperimentArmFromMetadata({ experimentArm: "control" })).toBeNull();
  });
});

describe("experiment daily bucketing", () => {
  it("fills UTC date keys and aggregates funnel events", () => {
    const since = new Date("2026-05-10T12:00:00.000Z");
    const keys = buildExperimentDateKeys(since, 3);
    expect(keys).toEqual(["2026-05-10", "2026-05-11", "2026-05-12"]);

    const buckets = initExperimentDailyBuckets(keys);
    accumulateExperimentFunnelEvent(buckets, {
      dateKey: "2026-05-10",
      arm: "draft",
      eventName: "experiment.exposure",
    });
    accumulateExperimentFunnelEvent(buckets, {
      dateKey: "2026-05-10",
      arm: "draft",
      eventName: "checkout_start",
    });
    accumulateExperimentFunnelEvent(buckets, {
      dateKey: "2026-05-10",
      arm: "draft",
      eventName: "checkout_submit",
    });
    accumulateExperimentFunnelEvent(buckets, {
      dateKey: "2026-05-11",
      arm: "published",
      eventName: "checkout_start",
    });

    const rows = experimentDailyChartRowsFromBuckets(buckets);
    expect(rows).toHaveLength(3);
    expect(rows[0].draft.exposures).toBe(1);
    expect(rows[0].draft.conversions).toBe(1);
    expect(rows[0].draft.conversionRatePercent).toBe(100);
    expect(rows[1].published.checkouts).toBe(1);

    const totals = sumExperimentArmCounts(rows);
    expect(totals.draft.exposures).toBe(1);
    expect(totals.published.checkouts).toBe(1);
  });
});

describe("conversionRatePercent", () => {
  it("rounds to one decimal", () => {
    expect(conversionRatePercent(3, 1)).toBe(33.3);
    expect(conversionRatePercent(0, 1)).toBe(0);
  });
});
