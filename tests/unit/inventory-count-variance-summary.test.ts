import { describe, expect, it } from "vitest";

import { summarizeInventoryCountVariance } from "@/services/inventory/count-service";

describe("summarizeInventoryCountVariance", () => {
  it("aggregates counted lines and splits shrink vs overage cost", () => {
    const summary = summarizeInventoryCountVariance([
      { countedQty: 8, varianceQty: -2, varianceCost: -10 },
      { countedQty: 12, varianceQty: 2, varianceCost: 6 },
      { countedQty: null, varianceQty: null, varianceCost: null },
      { countedQty: 5, varianceQty: 0, varianceCost: 0 },
    ]);

    expect(summary).toEqual({
      lineCount: 4,
      linesCounted: 3,
      linesUncounted: 1,
      linesWithVariance: 2,
      totalVarianceQty: 0,
      totalVarianceCost: -4,
      shrinkCost: -10,
      overageCost: 6,
    });
  });
});
