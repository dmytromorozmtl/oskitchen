import { describe, expect, it } from "vitest";

import { compositeMarketHostLabel } from "@/lib/storefront/market-host-resolve";
import { marketCatalogCacheKey } from "@/lib/storefront/market-resolve";
import { storefrontMarketSchema } from "@/lib/storefront/markets";

describe("storefront market resolve", () => {
  it("marketCatalogCacheKey segments by market and menu", () => {
    expect(marketCatalogCacheKey("weekday", "menu-uuid")).toBe("weekday:menu-uuid");
    expect(marketCatalogCacheKey("default", null)).toBe("default:none");
  });

  it("compositeMarketHostLabel builds hello-weekday style host", () => {
    expect(compositeMarketHostLabel("hello", "weekday")).toBe("hello-weekday");
  });

  it("accepts hostSubdomain and activeMenuId on market schema", () => {
    const parsed = storefrontMarketSchema.safeParse({
      id: "weekday",
      name: "Weekday",
      hostSubdomain: "hello-weekday",
      activeMenuId: "00000000-0000-4000-8000-000000000001",
    });
    expect(parsed.success).toBe(true);
  });
});
