import { describe, expect, it } from "vitest";

import {
  buildSevenShiftsUserMap,
  parseSevenShiftsDateTime,
} from "@/services/integrations/seven-shifts-import-service";

describe("seven-shifts import", () => {
  it("parses 7shifts datetime into date and HH:mm", () => {
    const parsed = parseSevenShiftsDateTime("2026-06-15 09:30:00");
    expect(parsed.time).toBe("09:30");
    expect(parsed.shiftDate.getFullYear()).toBe(2026);
    expect(parsed.shiftDate.getMonth()).toBe(5);
    expect(parsed.shiftDate.getDate()).toBe(15);
  });

  it("builds user id → staff member map from panel mappings", () => {
    const map = buildSevenShiftsUserMap({
      "staff-a": "101",
      "staff-b": "202",
      "staff-c": "invalid",
    });
    expect(map.get(101)).toBe("staff-a");
    expect(map.get(202)).toBe("staff-b");
    expect(map.has(0)).toBe(false);
  });
});
