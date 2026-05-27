import { describe, expect, it } from "vitest";

import { buildCountStockAdjustments } from "@/services/inventory/count-service";

describe("buildCountStockAdjustments", () => {
  it("includes only lines with a counted quantity", () => {
    const adjustments = buildCountStockAdjustments([
      { ingredientId: "a", expectedQty: 10, countedQty: 8 },
      { ingredientId: "b", expectedQty: 5, countedQty: null },
      { ingredientId: "c", expectedQty: 2, countedQty: 2.5 },
    ]);
    expect(adjustments).toEqual([
      { ingredientId: "a", expectedQty: 10, countedQty: 8 },
      { ingredientId: "c", expectedQty: 2, countedQty: 2.5 },
    ]);
  });
});
