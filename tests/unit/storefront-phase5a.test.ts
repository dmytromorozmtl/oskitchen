import { describe, expect, it } from "vitest";

import { slugifyCollectionSlug, validateCollectionSlugFormat } from "@/lib/menus/collection-slug";
import { markdownLiteToHtml } from "@/lib/storefront/markdown-lite";
import { buildSectionsCreateInput, pageSectionTemplateForType } from "@/lib/storefront/page-section-templates";
import { resolveSectionPack, sectionPackToCreatePayload } from "@/lib/storefront/section-packs";
import { buildBreadcrumbJsonLd } from "@/lib/storefront/seo";
import { StorefrontPageType } from "@prisma/client";

describe("collectionSlug", () => {
  it("slugifies valid input", () => {
    expect(slugifyCollectionSlug("Weekly Specials!")).toBe("weekly-specials");
  });

  it("rejects reserved slugs", () => {
    const r = validateCollectionSlugFormat("menu");
    expect(r.ok).toBe(false);
  });
});

describe("section packs", () => {
  it("hero_cta pack has two sections", () => {
    const pack = resolveSectionPack("hero_cta");
    expect(pack).toBeTruthy();
    expect(sectionPackToCreatePayload(pack!).length).toBe(2);
  });
});

describe("page templates", () => {
  it("thank-you template is noindex", () => {
    const tpl = pageSectionTemplateForType(StorefrontPageType.THANK_YOU);
    expect(tpl.robotsNoindex).toBe(true);
    expect(buildSectionsCreateInput(StorefrontPageType.THANK_YOU).length).toBeGreaterThan(0);
  });

  it("catering template includes markdown body", () => {
    const tpl = pageSectionTemplateForType(StorefrontPageType.CATERING);
    const text = tpl.sections.find((s) => s.content?.bodyFormat === "markdown");
    expect(text).toBeTruthy();
  });
});

describe("markdownLiteToHtml", () => {
  it("renders bold", () => {
    expect(markdownLiteToHtml("**hi**")).toContain("<strong>hi</strong>");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("emits BreadcrumbList", () => {
    const ld = buildBreadcrumbJsonLd([
      { name: "Home", url: "https://x.test/" },
      { name: "Menu", url: "https://x.test/menu" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(2);
  });
});
