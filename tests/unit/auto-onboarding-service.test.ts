import { describe, expect, it } from "vitest";

import {
  mapCuisineToQuickStartType,
  parseAutoOnboardingAnswers,
  resolveChannelsFromAnswers,
} from "@/services/onboarding/auto-onboarding-service";

describe("auto-onboarding-service", () => {
  it("maps pizza to qsr quick-start type", () => {
    expect(mapCuisineToQuickStartType("pizza")).toBe("qsr");
    expect(mapCuisineToQuickStartType("sushi")).toBe("full_service");
  });

  it("enables delivery channels when delivers is true", () => {
    const channels = resolveChannelsFromAnswers({
      cuisine: "qsr",
      seatCount: 30,
      delivers: true,
      averageOrderValue: 18,
      specialRequirements: "",
      businessName: "Test",
    });
    expect(channels).toContain("delivery_apps");
  });

  it("uses all channels for large venues", () => {
    const channels = resolveChannelsFromAnswers({
      cuisine: "full_service",
      seatCount: 120,
      delivers: false,
      averageOrderValue: 45,
      specialRequirements: "",
      businessName: "Big Hall",
    });
    expect(channels).toContain("all");
  });

  it("parses form answers", () => {
    const parsed = parseAutoOnboardingAnswers({
      cuisine: "coffee_shop",
      seatCount: "12",
      delivers: "true",
      averageOrderValue: "9.5",
      specialRequirements: "oat milk",
      businessName: "Daily Grind",
    });
    expect(parsed.cuisine).toBe("coffee_shop");
    expect(parsed.seatCount).toBe(12);
    expect(parsed.delivers).toBe(true);
  });
});
