import { describe, expect, it } from "vitest";

import {
  buildHomebaseUserMap,
  parseHomebaseDateTime,
} from "@/services/integrations/homebase-import-service";

describe("homebase import", () => {
  it("parses ISO datetime into date and HH:mm", () => {
    const parsed = parseHomebaseDateTime("2026-06-15T09:30:00-04:00");
    expect(parsed.time).toBe("09:30");
    expect(parsed.shiftDate.getFullYear()).toBe(2026);
    expect(parsed.shiftDate.getMonth()).toBe(5);
    expect(parsed.shiftDate.getDate()).toBe(15);
  });

  it("builds employee id → staff member map from panel mappings", () => {
    const map = buildHomebaseUserMap({
      "staff-a": "emp-uuid-101",
      "staff-b": "emp-uuid-202",
      "staff-c": "",
    });
    expect(map.get("emp-uuid-101")).toBe("staff-a");
    expect(map.get("emp-uuid-202")).toBe("staff-b");
    expect(map.has("")).toBe(false);
  });
});
