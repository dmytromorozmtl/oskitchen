import { describe, expect, it } from "vitest";

import {
  allStorefrontCatalogTags,
  storefrontCatalogTag,
} from "@/lib/storefront/cache-tags";

describe("storefront cache tags", () => {
  it("storefrontCatalogTag includes market id when set", () => {
    expect(storefrontCatalogTag("hello")).toBe("sf-catalog-hello");
    expect(storefrontCatalogTag("hello", "weekday")).toBe("sf-catalog-hello-weekday");
    expect(storefrontCatalogTag("hello", "default")).toBe("sf-catalog-hello");
  });

  it("allStorefrontCatalogTags dedupes base + markets", () => {
    const tags = allStorefrontCatalogTags("hello", ["default", "weekday", "weekday"]);
    expect(tags).toContain("sf-catalog-hello");
    expect(tags).toContain("sf-catalog-hello-weekday");
    expect(tags.filter((t) => t === "sf-catalog-hello-weekday")).toHaveLength(1);
  });
});
