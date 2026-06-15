import { describe, expect, it } from "vitest";

import { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";

describe("evaluate-era25-first-charter-slice-readiness", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateEra25FirstCharterSliceReadiness({})).not.toThrow();
  });

  it("reports honest no-charter state locally", () => {
    const result = evaluateEra25FirstCharterSliceReadiness({});
    expect(result.charterValidation.charterDocPath).toBeNull();
    expect(result.charterValidation.sectionsValid).toBe(false);
    expect(result.requiredSectionCount).toBe(10);
    expect(result.charterExit.terminusGuard.guard.guardPassed).toBe(true);
  });
});
