import { describe, expect, it } from "vitest";

import { slugifyVendorProduct } from "@/lib/marketplace/vendor-product-filters";

describe("vendor product helpers", () => {
  it("slugifies product name and sku", () => {
    expect(slugifyVendorProduct("Nitrile Gloves (Large)", "GL-NIT-L")).toBe("nitrile-gloves-large-gl-nit-l");
  });
});
