import { describe, expect, it } from "vitest";

import {
  getOperatingModeForBusinessType,
  isDailyServiceMode,
  operatingModeFromOperatingModelId,
} from "@/lib/operating-modes/resolver";

describe("operating-modes", () => {
  it("maps restaurant types to daily service", () => {
    expect(getOperatingModeForBusinessType("RESTAURANT")).toBe("DAILY_SERVICE");
    expect(getOperatingModeForBusinessType("CAFE")).toBe("DAILY_SERVICE");
    expect(getOperatingModeForBusinessType("BAR")).toBe("DAILY_SERVICE");
  });

  it("maps meal prep to weekly preorder", () => {
    expect(getOperatingModeForBusinessType("MEAL_PREP")).toBe("WEEKLY_PREORDER");
    expect(getOperatingModeForBusinessType("BAKERY")).toBe("WEEKLY_PREORDER");
  });

  it("derives mode from onboarding operating model", () => {
    expect(operatingModeFromOperatingModelId("WEEKLY_PREORDERS")).toBe("WEEKLY_PREORDER");
    expect(operatingModeFromOperatingModelId("WALK_IN_DAILY")).toBe("DAILY_SERVICE");
  });

  it("detects daily service flag", () => {
    expect(isDailyServiceMode("DAILY_SERVICE")).toBe(true);
    expect(isDailyServiceMode("WEEKLY_PREORDER")).toBe(false);
  });
});
