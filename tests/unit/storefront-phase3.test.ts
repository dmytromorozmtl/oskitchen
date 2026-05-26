import { describe, expect, it } from "vitest";

import {
  localeAlternateUrl,
  parseStorefrontInternalPathWithLocale,
  stripLocalePrefixFromInternalPath,
} from "@/lib/storefront/locale-path";
import { resolvePageMetaForLocale, upsertPageMetaSlice } from "@/lib/storefront/localized-page-meta";
import { buildStorefrontPublishChecklist } from "@/lib/storefront/publish-checklist";
import { buildThemePublishDiff } from "@/lib/storefront/theme-publish-diff";

describe("Phase 3 — locale URL", () => {
  it("parses and strips locale segment", () => {
    const parsed = parseStorefrontInternalPathWithLocale("/s/demo/fr/menu");
    expect(parsed?.locale).toBe("fr");
    expect(parsed?.pathSuffix).toBe("/menu");
    const { rewritten, locale } = stripLocalePrefixFromInternalPath("/s/demo/fr/menu");
    expect(locale).toBe("fr");
    expect(rewritten).toBe("/s/demo/menu");
  });

  it("builds alternate URLs", () => {
    expect(localeAlternateUrl("https://shop.test/s/demo", "/menu", "fr", "en")).toBe(
      "https://shop.test/s/demo/fr/menu",
    );
    expect(localeAlternateUrl("https://shop.test/s/demo", "/menu", "en", "en")).toBe(
      "https://shop.test/s/demo/menu",
    );
  });
});

describe("Phase 3 — page meta i18n", () => {
  it("stores and resolves localized page meta", () => {
    const content = upsertPageMetaSlice(
      {},
      "fr",
      "en",
      { title: "À propos", seoTitle: "À propos", seoDescription: "FR desc" },
      { title: "About", seoTitle: "About", seoDescription: "EN desc" },
    );
    const fr = resolvePageMetaForLocale(content, "fr", "en", {
      title: "About",
      seoTitle: undefined,
      seoDescription: undefined,
    });
    expect(fr.title).toBe("À propos");
  });
});

describe("Phase 3 — publish checklist & diff", () => {
  it("flags unpublished theme", () => {
    const items = buildStorefrontPublishChecklist({
      storeSlug: "demo",
      themePublishedAt: null,
      navigationItemsJson: { items: [{ id: "1", label: "A", target: { kind: "home" } }, { id: "2", label: "B", target: { kind: "menu" } }] },
      editorLocales: ["en", "fr"],
      defaultLocale: "en",
      pages: [],
    });
    expect(items.find((i) => i.id === "theme")?.ok).toBe(false);
  });

  it("summarizes nav count change on publish", () => {
    const diff = buildThemePublishDiff(
      { navigationItemsJson: { items: [{ id: "1", label: "A", target: { kind: "home" } }] }, footerBlocksJson: { blocks: [] }, brandColor: "#000", secondaryColor: null, backgroundColor: null, textColor: null },
      { version: 1, navigationItems: [] },
    );
    expect(diff.some((d) => d.area === "navigation")).toBe(true);
  });
});
