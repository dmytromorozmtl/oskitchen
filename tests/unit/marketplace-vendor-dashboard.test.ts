import { describe, expect, it } from "vitest";

import { format, subDays } from "date-fns";

describe("vendor dashboard helpers", () => {
  it("builds 30-day trend bucket keys", () => {
    const keys: string[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      keys.push(format(subDays(new Date("2026-06-01T12:00:00"), i), "yyyy-MM-dd"));
    }
    expect(keys).toHaveLength(30);
    expect(keys[0]).toBe("2026-05-03");
    expect(keys[29]).toBe("2026-06-01");
  });
});
