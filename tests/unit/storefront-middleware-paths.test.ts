import { describe, expect, it } from "vitest";

import { mapVanityPathToInternal } from "@/lib/storefront/middleware-paths";

describe("mapVanityPathToInternal", () => {
  it("maps nested policies path", () => {
    expect(mapVanityPathToInternal("hello", "/policies/privacy")).toEqual({
      internal: "/s/hello/policies/privacy",
      locale: null,
    });
  });

  it("maps sitemap.xml", () => {
    expect(mapVanityPathToInternal("hello", "/sitemap.xml")).toEqual({
      internal: "/s/hello/sitemap.xml",
      locale: null,
    });
  });

  it("maps vanity locale prefix before storefront root", () => {
    expect(mapVanityPathToInternal("shop", "/fr/menu")).toEqual({
      internal: "/s/shop/menu",
      locale: "fr",
    });
  });

  it("returns null for blocked root", () => {
    expect(mapVanityPathToInternal("hello", "/dashboard")).toBeNull();
  });
});
