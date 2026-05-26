import { describe, expect, it } from "vitest";

import { parseBrandStoreCompositeHost } from "@/lib/storefront/brand-host-resolve";

describe("phase8 brand host", () => {
  it("parses brand.store composite subdomain", () => {
    const parsed = parseBrandStoreCompositeHost("weekend.hello.kitchenos.com", "kitchenos.com");
    expect(parsed).toEqual({ brandSlug: "weekend", storeSlug: "hello" });
  });

  it("rejects single-label subdomain", () => {
    expect(parseBrandStoreCompositeHost("hello.kitchenos.com", "kitchenos.com")).toBeNull();
  });
});
