import { describe, expect, it } from "vitest";

import {
  closedShiftCsvFilename,
  CLOSED_SHIFT_CSV_HEADERS,
  serializeClosedShiftSummariesToCsv,
} from "@/lib/pos/pos-shift-close-csv-era18";
import { POS_SHIFT_CLOSE_CSV_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-close-csv-era18-policy";

describe("pos shift close csv era18", () => {
  it("locks era18 shift close csv policy id", () => {
    expect(POS_SHIFT_CLOSE_CSV_ERA18_POLICY_ID).toBe("era18-pos-shift-close-csv-v1");
  });

  it("serializes closed shifts to csv with headers", () => {
    const csv = serializeClosedShiftSummariesToCsv([
      {
        shiftId: "shift-1",
        registerName: "Front counter",
        openedAtIso: "2026-05-28T08:00:00.000Z",
        closedAtIso: "2026-05-28T16:00:00.000Z",
        openingCash: 50,
        closingCash: 75,
        expectedCash: 80,
        variance: -5,
        notes: "Short after payout",
        closedByName: "Alex",
      },
    ]);

    expect(csv.split("\n")[0]).toBe(CLOSED_SHIFT_CSV_HEADERS.join(","));
    expect(csv).toContain("shift-1");
    expect(csv).toContain("Front counter");
    expect(csv).toContain("-5.00");
    expect(csv).toContain("Short");
    expect(csv).toContain("Short after payout");
  });

  it("builds dated export filename", () => {
    expect(closedShiftCsvFilename(new Date("2026-05-28T12:00:00.000Z"))).toBe(
      "kitchenos-pos-shift-closeouts-2026-05-28.csv",
    );
  });
});
