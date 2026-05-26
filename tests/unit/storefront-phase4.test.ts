import { describe, expect, it } from "vitest";

import { computeStorefrontTranslationCoverage } from "@/lib/storefront/translation-coverage";
import { buildWebPageJsonLd, pageRobotsFromFlags } from "@/lib/storefront/seo";
import { StorefrontSectionType } from "@prisma/client";

describe("pageRobotsFromFlags", () => {
  it("noindexes draft preview for owner", () => {
    expect(pageRobotsFromFlags({ isOwnerPreview: true, published: false })).toEqual({
      index: false,
      follow: false,
    });
  });

  it("noindexes when page flag set", () => {
    expect(pageRobotsFromFlags({ pageRobotsNoindex: true, published: true })).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe("buildWebPageJsonLd", () => {
  it("emits WebPage schema", () => {
    const ld = buildWebPageJsonLd({ name: "About", url: "https://shop.test/p/about", locale: "fr" });
    expect(ld["@type"]).toBe("WebPage");
    expect(ld.name).toBe("About");
    expect(ld.inLanguage).toBe("fr");
  });
});

describe("computeStorefrontTranslationCoverage", () => {
  it("returns 100% when single locale", () => {
    const c = computeStorefrontTranslationCoverage({
      editorLocales: ["en"],
      defaultLocale: "en",
      pages: [],
    });
    expect(c.overallPercent).toBe(100);
  });
});

describe("SLIDER section type", () => {
  it("is a known enum value", () => {
    expect(StorefrontSectionType.SLIDER).toBe("SLIDER");
  });
});
