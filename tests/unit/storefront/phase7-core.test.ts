import { describe, expect, it } from "vitest";

import { mergeBrandThemeIntoStorefront } from "@/lib/storefront/brand-theme";
import { storefrontMenuImageUrl, storefrontProductImageUrl } from "@/lib/storefront/product-image-url";

describe("phase7 brand theme", () => {
  it("merges brand colors when storefront tokens empty", () => {
    const merged = mergeBrandThemeIntoStorefront(
      {
        brandColor: null,
        secondaryColor: null,
        logoUrl: null,
        faviconUrl: null,
        coverImageUrl: null,
        seoTitle: null,
        seoDescription: null,
        heroImageUrl: null,
      },
      {
        brandColor: "#112233",
        secondaryColor: "#445566",
        logoUrl: "https://cdn.example/logo.png",
        faviconUrl: null,
        coverImageUrl: null,
        seoTitle: "Brand SEO",
        seoDescription: "Brand desc",
      },
    );
    expect(merged.brandColor).toBe("#112233");
    expect(merged.logoUrl).toContain("logo.png");
    expect(merged.seoTitle).toBe("Brand SEO");
  });

  it("storefront values win over brand", () => {
    const merged = mergeBrandThemeIntoStorefront(
      {
        brandColor: "#ffffff",
        secondaryColor: null,
        logoUrl: "https://sf/logo.png",
        faviconUrl: null,
        coverImageUrl: null,
        seoTitle: "SF",
        seoDescription: null,
        heroImageUrl: null,
      },
      {
        brandColor: "#000000",
        secondaryColor: null,
        logoUrl: "https://brand/logo.png",
        faviconUrl: null,
        coverImageUrl: null,
        seoTitle: "Brand",
        seoDescription: null,
      },
    );
    expect(merged.brandColor).toBe("#ffffff");
    expect(merged.logoUrl).toBe("https://sf/logo.png");
  });
});

describe("phase7 product image cdn", () => {
  it("transforms supabase public urls", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/media/products/a.jpg";
    const out = storefrontProductImageUrl(url, { width: 400 });
    expect(out).toContain("/storage/v1/render/image/public/");
    expect(out).toContain("width=400");
  });

  it("menu helper defaults width", () => {
    const url = storefrontMenuImageUrl("https://x.supabase.co/storage/v1/object/public/b/x.png");
    expect(url).toContain("width=640");
  });
});
