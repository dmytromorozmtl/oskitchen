import { describe, expect, it } from "vitest";

import { buildOnboardingFlow } from "@/lib/onboarding/onboarding-flow-builder";
import { shouldShowWeeklyMenuStep } from "@/lib/onboarding/onboarding-business-modes";

describe("shouldShowWeeklyMenuStep", () => {
  it("shows weekly menu only for meal prep and bakery", () => {
    expect(shouldShowWeeklyMenuStep("MEAL_PREP", "WEEKLY_PREORDERS")).toBe(true);
    expect(shouldShowWeeklyMenuStep("BAKERY", "BAKERY_CUSTOM_PREORDERS")).toBe(true);
    expect(shouldShowWeeklyMenuStep("CAFE", "PICKUP")).toBe(false);
    expect(shouldShowWeeklyMenuStep("RESTAURANT", "WALK_IN_DAILY")).toBe(false);
    expect(shouldShowWeeklyMenuStep("BAR", "WALK_IN_DAILY")).toBe(false);
  });

  it("omits weekly_menu from café flow", () => {
    const flow = buildOnboardingFlow({
      businessType: "CAFE",
      operatingModel: "PICKUP",
    });
    expect(flow.stepIds).not.toContain("weekly_menu");
  });
});
