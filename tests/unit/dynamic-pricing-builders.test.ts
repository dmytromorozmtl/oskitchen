import { describe, expect, it } from "vitest";

import {
  combineMultipliers,
  computeSuggestedPrice,
  localEventMultiplier,
  timeOfDayMultiplier,
  weatherMultiplier,
} from "@/lib/ai/dynamic-pricing-builders";

describe("dynamic-pricing-builders", () => {
  it("boosts lunch and dinner", () => {
    expect(timeOfDayMultiplier(12).multiplier).toBeGreaterThan(1);
    expect(timeOfDayMultiplier(19).multiplier).toBeGreaterThan(1);
    expect(timeOfDayMultiplier(15).multiplier).toBe(1);
  });

  it("rain increases multiplier", () => {
    expect(weatherMultiplier("rain").multiplier).toBeGreaterThan(1);
  });

  it("weekend event applies on Saturday", () => {
    const sat = new Date("2026-06-06T12:00:00");
    expect(localEventMultiplier(sat)?.multiplier).toBeGreaterThan(1);
  });

  it("caps combined adjustment on menu price", () => {
    const combined = combineMultipliers([1.08, 1.05, 1.04]);
    const out = computeSuggestedPrice(10, combined);
    expect(out).toBeLessThanOrEqual(11.2);
    expect(out).toBeGreaterThan(10);
  });
});
