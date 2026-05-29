import { describe, expect, it } from "vitest";

import {
  discoverEra25CharterDocs,
  evaluateEra25CharterExitOutsideLinearPath,
} from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

describe("evaluate-era25-charter-exit-outside-linear-path", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateEra25CharterExitOutsideLinearPath({})).not.toThrow();
  });

  it("discovers no era25 charter docs by default", () => {
    expect(discoverEra25CharterDocs()).toEqual([]);
    const result = evaluateEra25CharterExitOutsideLinearPath({});
    expect(result.signedCharterPresent).toBe(false);
    expect(result.terminusGuard.guard.guardPassed).toBe(true);
  });

  it("reports honest checklist state locally", () => {
    const result = evaluateEra25CharterExitOutsideLinearPath({});
    expect(result.criteriaCount).toBe(5);
    expect(result.processDoc).toContain("next-era25-charter-exit");
  });
});
