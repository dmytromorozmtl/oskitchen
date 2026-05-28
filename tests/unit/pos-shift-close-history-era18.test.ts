import { describe, expect, it } from "vitest";

import {
  formatShiftClosedAt,
  summarizeClosedShiftHistory,
} from "@/lib/pos/pos-shift-close-history-era18";
import { POS_SHIFT_CLOSE_HISTORY_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-close-history-era18-policy";
import { formatShiftVarianceDisplay } from "@/lib/pos/pos-shift-closeout-preview";

describe("pos shift close history era18", () => {
  it("locks era18 shift close history policy id", () => {
    expect(POS_SHIFT_CLOSE_HISTORY_ERA18_POLICY_ID).toBe(
      "era18-pos-shift-close-history-v1",
    );
  });

  it("summarizes variance counts in history", () => {
    expect(
      summarizeClosedShiftHistory([
        {
          shiftId: "s1",
          registerName: "Front",
          openedAtIso: "2026-05-28T08:00:00.000Z",
          closedAtIso: "2026-05-28T16:00:00.000Z",
          openingCash: 50,
          closingCash: 80,
          expectedCash: 80,
          variance: 0,
          notes: null,
          closedByName: "Alex",
        },
        {
          shiftId: "s2",
          registerName: "Front",
          openedAtIso: "2026-05-27T08:00:00.000Z",
          closedAtIso: "2026-05-27T16:00:00.000Z",
          openingCash: 50,
          closingCash: 75,
          expectedCash: 80,
          variance: -5,
          notes: "Short after payout",
          closedByName: "Alex",
        },
      ]),
    ).toEqual({ total: 2, withVariance: 1 });
  });

  it("formats closed-at timestamps for operators", () => {
    expect(formatShiftClosedAt("2026-05-28T16:30:00.000Z")).toMatch(/May/);
  });

  it("formats variance display for badges", () => {
    expect(formatShiftVarianceDisplay(0)).toBe("Balanced");
    expect(formatShiftVarianceDisplay(-5)).toBe("-$5.00");
  });
});
