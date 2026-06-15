import { describe, expect, it } from "vitest";

import {
  evaluateSequentialDecision,
  evaluateSequentialLook,
  obrienFlemingZ,
} from "@/lib/storefront/theme-experiment-sequential";

describe("theme-experiment-sequential", () => {
  it("O'Brien-Fleming z decreases with more looks", () => {
    const z1 = obrienFlemingZ(0.25);
    const z4 = obrienFlemingZ(1);
    expect(z1).toBeGreaterThan(z4);
  });

  it("evaluateSequentialLook returns boundary", () => {
    const look = evaluateSequentialLook({ lookIndex: 2, maxLooks: 4 });
    expect(look.lookIndex).toBe(2);
    expect(look.zBoundary).toBeGreaterThan(1.5);
  });

  it("sequential off passes by default", () => {
    const d = evaluateSequentialDecision({ zStat: 1.5, lookIndex: 1, maxLooks: 4 });
    expect(d.enabled).toBe(false);
    expect(d.passedBoundary).toBe(true);
  });
});
