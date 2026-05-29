import { describe, expect, it } from "vitest";

import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";

describe("evaluate-era25-first-product-slice-blueprint", () => {
  it("blocks blueprint when gates are blocked", () => {
    const evaluation = evaluateEra25FirstProductSliceBlueprint({});
    expect(evaluation.blueprintBlocked).toBe(true);
    expect(evaluation.canonicalSliceName).toBe("owner-daily-briefing-breakthrough");
    expect(evaluation.stagingChecklist.sectionsValid).toBe(true);
    expect(evaluation.canonicalCharterDocPath).toBeNull();
  });
});
