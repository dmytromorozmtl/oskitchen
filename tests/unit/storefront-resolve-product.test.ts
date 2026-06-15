import { describe, expect, it } from "vitest";

import { findProductByPublicRef, productUrlSegment } from "@/lib/storefront/resolve-product-ref";

describe("findProductByPublicRef", () => {
  const products = [
    { id: "11111111-1111-4111-8111-111111111111", publicSlug: "beef-bowl" },
    { id: "22222222-2222-4222-8222-222222222222", publicSlug: null },
  ];

  it("resolves UUID", () => {
    expect(findProductByPublicRef(products, "11111111-1111-4111-8111-111111111111")?.id).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("resolves slug case-insensitively", () => {
    expect(findProductByPublicRef(products, "Beef-Bowl")?.id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("returns null for unknown", () => {
    expect(findProductByPublicRef(products, "nope")).toBeNull();
  });
});

describe("productUrlSegment", () => {
  it("prefers slug when set", () => {
    expect(productUrlSegment({ id: "abc", publicSlug: "my-dish" })).toBe("my-dish");
  });

  it("falls back to id", () => {
    expect(productUrlSegment({ id: "22222222-2222-4222-8222-222222222222", publicSlug: null })).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
  });
});
