import { describe, expect, it } from "vitest";

import { themePresetToSettingsPatch } from "@/services/storefront/apply-theme-preset-service";
import {
  ensureLocalizedEditorState,
  pageTranslationSummary,
  resolveSectionContentForLocale,
  upsertLocalizedSectionSlice,
} from "@/lib/storefront/localized-content";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";
import { textBlockSchema } from "@/lib/storefront/sections";
import { parseFooterBlocks, parseNavigationItems } from "@/lib/storefront-builder/nav-footer-parse";

describe("Phase 2 — localized section content", () => {
  it("resolves locale slice from wrapped contentJson", () => {
    const raw = {
      _localized: true,
      version: 1,
      defaultLocale: "en",
      byLocale: {
        en: { body: "Hello" },
        fr: { body: "Bonjour" },
      },
    };
    expect(resolveSectionContentForLocale(raw, "fr").body).toBe("Bonjour");
    const parsed = parseSectionContentForLocale(textBlockSchema, raw, "fr", "en");
    expect(parsed?.body).toBe("Bonjour");
  });

  it("upserts a locale slice without dropping other locales", () => {
    const next = upsertLocalizedSectionSlice(
      { heading: "Hi", body: "English" },
      "fr",
      "en",
      { heading: "Salut", body: "Français" },
    );
    expect(next.byLocale.en?.body).toBe("English");
    expect(next.byLocale.fr?.body).toBe("Français");
  });

  it("flags missing translation on pages list summary", () => {
    const summary = pageTranslationSummary(
      [
        { type: "TEXT_BLOCK", contentJson: ensureLocalizedEditorState({ body: "ok" }, "en", ["fr"]) },
      ],
      ["en", "fr"],
    );
    const fr = summary.find((s) => s.locale === "fr");
    expect(fr?.missingCount).toBeGreaterThan(0);
  });
});

describe("Phase 2 — nav/footer parse", () => {
  it("parses navigation items wrapper", () => {
    const items = parseNavigationItems({ items: [{ id: "a", label: "Menu", target: { kind: "menu" } }] });
    expect(items).toHaveLength(1);
    expect(items[0]?.label).toBe("Menu");
  });

  it("parses footer link blocks", () => {
    const blocks = parseFooterBlocks({
      blocks: [{ id: "b1", type: "links", title: "Shop", links: [{ id: "l1", label: "Menu", href: "/menu" }] }],
    });
    expect(blocks[0]?.type).toBe("links");
  });
});

describe("Phase 2 — theme preset apply", () => {
  it("maps preset id to settings patch", () => {
    const patch = themePresetToSettingsPatch("modern_minimal");
    expect(patch?.themePreset).toBe("modern_minimal");
    expect(patch?.brandColor).toBeTruthy();
  });
});
