import { describe, expect, it } from "vitest";

import {
  buildShiftCloseHistoryExportHref,
  DEFAULT_SHIFT_CLOSE_HISTORY_RANGE,
  parseShiftCloseHistoryRangeParam,
  resolveShiftCloseHistoryRangeBounds,
  shiftCloseHistoryRangeDays,
  SHIFT_CLOSE_HISTORY_RANGE_MAX_DAYS,
} from "@/lib/pos/pos-shift-close-history-range-era18";
import { POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-close-history-range-era18-policy";

describe("pos shift close history range era18", () => {
  it("locks era18 history range policy id", () => {
    expect(POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_POLICY_ID).toBe(
      "era18-pos-shift-close-history-range-v1",
    );
  });

  it("defaults invalid range params to 7d", () => {
    expect(parseShiftCloseHistoryRangeParam(null)).toBe(DEFAULT_SHIFT_CLOSE_HISTORY_RANGE);
    expect(parseShiftCloseHistoryRangeParam("invalid")).toBe("7d");
    expect(parseShiftCloseHistoryRangeParam("30d")).toBe("30d");
  });

  it("resolves bounded closedAt window for presets", () => {
    const now = new Date("2026-05-28T15:30:00.000Z");
    const bounds = resolveShiftCloseHistoryRangeBounds("7d", now);

    expect(bounds.closedBefore.toISOString()).toBe(now.toISOString());
    expect(bounds.closedAfter.toISOString()).toBe("2026-05-21T00:00:00.000Z");
  });

  it("caps max preset at 90 days", () => {
    expect(shiftCloseHistoryRangeDays("90d")).toBe(SHIFT_CLOSE_HISTORY_RANGE_MAX_DAYS);
    const bounds = resolveShiftCloseHistoryRangeBounds("90d", new Date("2026-05-28T00:00:00.000Z"));
    expect(bounds.closedAfter.getTime()).toBeLessThan(bounds.closedBefore.getTime());
  });

  it("builds export href with range query", () => {
    expect(buildShiftCloseHistoryExportHref("30d")).toBe("/api/pos/shifts/export?range=30d");
  });
});
