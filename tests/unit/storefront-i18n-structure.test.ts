import { describe, expect, it } from "vitest";

import {
  buildStorefrontI18nStructureSnapshot,
  diffI18nStructurePaths,
} from "@/lib/storefront/i18n-structure-snapshot";

describe("storefront i18n structure snapshots", () => {
  const enNav = {
    items: [
      { label: "Menu", href: "/s/demo/menu", target: { kind: "MENU" } },
      {
        label: "More",
        href: "#",
        children: [{ label: "About", href: "/s/demo/p/about", target: { kind: "PAGE", slug: "about" } }],
      },
    ],
  };

  const frNav = {
    items: [
      { label: "Carte", href: "/s/demo/fr/menu", target: { kind: "MENU" } },
      {
        label: "Plus",
        href: "#",
        children: [{ label: "À propos", href: "/s/demo/fr/p/about", target: { kind: "PAGE", slug: "about" } }],
      },
    ],
  };

  it("FR vs EN nav trees match structurally (labels ignored)", () => {
    const en = buildStorefrontI18nStructureSnapshot({ navigationItemsJson: enNav, sections: [] });
    const fr = buildStorefrontI18nStructureSnapshot({ navigationItemsJson: frNav, sections: [] });
    expect(diffI18nStructurePaths(en, fr)).toEqual([]);
    expect(en.nav[0]?.hrefPattern).toContain("/menu");
  });

  it("detects section type mismatch", () => {
    const en = buildStorefrontI18nStructureSnapshot({
      navigationItemsJson: { items: [] },
      sections: [{ type: "HERO", contentJson: { _localized: true, defaultLocale: "en", byLocale: { en: { headline: "Hi" } } } }],
    });
    const fr = buildStorefrontI18nStructureSnapshot({
      navigationItemsJson: { items: [] },
      sections: [{ type: "TEXT_BLOCK", contentJson: { _localized: true, defaultLocale: "fr", byLocale: { fr: { body: "Salut" } } } }],
    });
    expect(diffI18nStructurePaths(en, fr)).toContain("sections[0].type");
  });
});
