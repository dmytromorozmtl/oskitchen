import { describe, expect, it } from "vitest";

import { PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID } from "@/lib/production/production-calendar-cross-week-ui-policy";

describe("production calendar cross-week UI policy", () => {
  it("locks era10 cross-week UI policy id", () => {
    expect(PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID).toBe(
      "era10-production-calendar-cross-week-ui-v1",
    );
  });
});
