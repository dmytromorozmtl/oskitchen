import { describe, expect, it } from "vitest";

import { brandCookieOptions, isValidBrandId } from "@/lib/storefront/brand-cookie";
import { buildStorefrontRobotsTxt } from "@/lib/storefront/robots-txt";
import { guessVanityHostFromLabel } from "@/lib/storefront/resolve-vanity-host";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

describe("phase9 brand cookie", () => {
  it("validates UUID brand ids", () => {
    expect(isValidBrandId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidBrandId("not-a-uuid")).toBe(false);
  });

  it("emits kos_brand cookie options", () => {
    const opts = brandCookieOptions("550e8400-e29b-41d4-a716-446655440000", "weekend");
    expect(opts.map((o) => o.name)).toEqual(["kos_brand", "kos_brand_slug"]);
  });
});

describe("phase9 robots.txt", () => {
  const sf = { robotsPolicy: "index" } as StorefrontPublicPayload;

  it("includes sitemap when indexable", () => {
    const txt = buildStorefrontRobotsTxt({
      canonicalBase: "https://weekend.hello.example.com",
      sf,
      brandSlug: "weekend",
    });
    expect(txt).toContain("Sitemap: https://weekend.hello.example.com/sitemap.xml");
    expect(txt).toContain("# brand: weekend");
  });

  it("disallows all when noindex", () => {
    const txt = buildStorefrontRobotsTxt({
      canonicalBase: "https://hello.example.com",
      sf: { robotsPolicy: "noindex" } as StorefrontPublicPayload,
    });
    expect(txt).toContain("Disallow: /");
    expect(txt).not.toContain("Sitemap:");
  });
});

describe("phase9 vanity host guess", () => {
  it("defers dotted composite labels to DB", async () => {
    const guess = await guessVanityHostFromLabel("weekend.hello.kitchenos.com", "kitchenos.com");
    expect(guess.needsDbResolution).toBe(true);
    expect(guess.storeSlug).toBe("hello");
  });

  it("resolves single-label slug vanity without DB", async () => {
    const guess = await guessVanityHostFromLabel("hello.kitchenos.com", "kitchenos.com");
    expect(guess.storeSlug).toBe("hello");
    expect(guess.marketId).toBeNull();
    expect(guess.needsDbResolution).toBe(false);
  });
});
