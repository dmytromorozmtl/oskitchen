import { describe, expect, it } from "vitest";

import { chunkSitemapPaths, SITEMAP_MAX_URLS_PER_FILE } from "@/lib/storefront/sitemap-urls";
import { buildSitemapIndexXml, buildSitemapUrlsetXml } from "@/lib/storefront/sitemap-xml";
import { buildCollectionPageJsonLd } from "@/lib/storefront/seo";
import { resolvePageMetaForLocale } from "@/lib/storefront/localized-page-meta";
import {
  productMatchesDietaryFilter,
  sortCollectionProducts,
} from "@/lib/storefront/collection-settings";
import { storefrontPermissionsForRole } from "@/lib/storefront/storefront-permissions";
import { mapVanityPathToInternal } from "@/lib/storefront/middleware-paths";

describe("sitemap chunking", () => {
  it("returns index when over max urls", () => {
    const paths = Array.from({ length: SITEMAP_MAX_URLS_PER_FILE + 1 }, (_, i) => `/p/${i}`);
    const chunks = chunkSitemapPaths(paths);
    expect(chunks.length).toBe(2);
    const index = buildSitemapIndexXml({ base: "https://shop.test", storeSlug: "demo", chunkCount: chunks.length });
    expect(index).toContain("<sitemapindex");
    expect(index).toContain("/sitemaps/1.xml");
  });

  it("builds urlset with hreflang", () => {
    const xml = buildSitemapUrlsetXml({
      base: "https://shop.test",
      pathSuffixes: ["/menu"],
      primaryLocale: "en",
    });
    expect(xml).toContain('hreflang="fr"');
    expect(xml).toContain("/menu");
  });
});

describe("collection JSON-LD", () => {
  it("emits CollectionPage + ItemList", () => {
    const ld = buildCollectionPageJsonLd({
      name: "Summer",
      url: "https://shop.test/collections/summer",
      items: [{ name: "Salad", url: "https://shop.test/products/salad" }],
    });
    expect(ld["@type"]).toBe("CollectionPage");
    expect(ld.mainEntity["@type"]).toBe("ItemList");
  });
});

describe("localized page OG meta", () => {
  it("reads seoOgImageUrl per locale", () => {
    const content = {
      _pageMeta: {
        _localized: true,
        defaultLocale: "en",
        byLocale: {
          en: { seoOgImageUrl: "https://cdn.test/en.jpg" },
          fr: { seoOgImageUrl: "https://cdn.test/fr.jpg" },
        },
      },
    };
    const fr = resolvePageMetaForLocale(content, "fr", "en", {});
    expect(fr.seoOgImageUrl).toBe("https://cdn.test/fr.jpg");
  });
});

describe("collection merchandising helpers", () => {
  it("sorts by price ascending", () => {
    const sorted = sortCollectionProducts(
      [
        { title: "B", price: 20, sortOrder: 0 },
        { title: "A", price: 5, sortOrder: 1 },
      ],
      "price-asc",
    );
    expect(sorted[0]?.price).toBe(5);
  });

  it("matches vegan in allergens text", () => {
    expect(productMatchesDietaryFilter("Contains vegan ingredients", "vegan")).toBe(true);
    expect(productMatchesDietaryFilter("Dairy only", "vegan")).toBe(false);
  });
});

describe("staff role matrix", () => {
  it("grants publish when staffPublish opt set", () => {
    const perms = storefrontPermissionsForRole("STAFF", { marketingDraft: true, staffPublish: true });
    expect(perms.has("storefront:publish")).toBe(true);
    expect(perms.has("storefront:edit-draft")).toBe(true);
  });
});

describe("vanity sitemap chunks", () => {
  it("maps /sitemaps/2.xml", () => {
    const m = mapVanityPathToInternal("demo", "/sitemaps/2.xml");
    expect(m?.internal).toBe("/s/demo/sitemaps/2.xml");
  });
});
