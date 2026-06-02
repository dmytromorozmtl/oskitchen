import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_PRODUCT_COMPARISON_MAX,
  sliceProductsForComparison,
} from "@/components/marketplace/product-comparison-table";

describe("product comparison table helpers", () => {
  it("caps comparison columns at four products", () => {
    expect(MARKETPLACE_PRODUCT_COMPARISON_MAX).toBe(4);
    expect(sliceProductsForComparison(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c", "d"]);
  });

  it("returns fewer than four when input is shorter", () => {
    expect(sliceProductsForComparison(["a", "b"])).toEqual(["a", "b"]);
  });
});
