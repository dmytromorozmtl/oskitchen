import { describe, expect, it } from "vitest";

import { formatCountNetVarianceCost } from "@/lib/inventory/format-count-variance";
import { summarizeInventoryCountVariance } from "@/services/inventory/count-service";

describe("inventory count list variance", () => {
  it("formats net variance with sign", () => {
    const summary = summarizeInventoryCountVariance([
      { countedQty: 8, varianceQty: -2, varianceCost: -10 },
      { countedQty: 12, varianceQty: 2, varianceCost: 6 },
    ]);
    expect(formatCountNetVarianceCost(summary)).toBe("−$4.00");
  });

  it("shows dash when no lines are counted", () => {
    const summary = summarizeInventoryCountVariance([
      { countedQty: null, varianceQty: null, varianceCost: null },
    ]);
    expect(formatCountNetVarianceCost(summary)).toBe("—");
  });
});
