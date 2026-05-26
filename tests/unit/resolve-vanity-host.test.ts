import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storefront/market-host-resolve", () => ({
  resolveMarketFromHostLabel: vi.fn(),
}));

import { resolveMarketFromHostLabel } from "@/lib/storefront/market-host-resolve";
import { guessVanityHostFromLabel } from "@/lib/storefront/resolve-vanity-host";

describe("guessVanityHostFromLabel", () => {
  beforeEach(() => {
    vi.mocked(resolveMarketFromHostLabel).mockReset();
  });

  it("resolves slug-only vanity without calling market DB resolver", async () => {
    const guess = await guessVanityHostFromLabel("hello.kitchenos.com", "kitchenos.com");
    expect(guess).toEqual({
      storeSlug: "hello",
      marketId: null,
      needsDbResolution: false,
    });
    expect(resolveMarketFromHostLabel).not.toHaveBeenCalled();
  });

  it("defers brand.store composite to resolve-host API", async () => {
    const guess = await guessVanityHostFromLabel("weekend.hello.kitchenos.com", "kitchenos.com");
    expect(guess.needsDbResolution).toBe(true);
    expect(guess.storeSlug).toBe("hello");
    expect(resolveMarketFromHostLabel).not.toHaveBeenCalled();
  });

  it("uses market resolver for composite market host labels", async () => {
    vi.mocked(resolveMarketFromHostLabel).mockResolvedValue({
      storeSlug: "hello",
      marketId: "weekday",
    });
    const guess = await guessVanityHostFromLabel("hello-weekday.kitchenos.com", "kitchenos.com");
    expect(resolveMarketFromHostLabel).toHaveBeenCalledWith("hello-weekday");
    expect(guess).toEqual({
      storeSlug: "hello",
      marketId: "weekday",
      needsDbResolution: false,
    });
  });
});
