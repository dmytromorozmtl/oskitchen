import { describe, expect, it } from "vitest";

import { isStorefrontCheckoutPath } from "@/lib/storefront/store-path";
import { mergePublishedThemeTokensIntoSettings } from "@/lib/storefront/theme-snapshot";
import { defaultFallbackNav, parseStorefrontNavigationItems } from "@/lib/storefront/navigation-validation";

describe("storefront checkout boundary", () => {
  it("detects checkout path", () => {
    expect(isStorefrontCheckoutPath("/s/demo/checkout")).toBe(true);
    expect(isStorefrontCheckoutPath("/s/demo/menu")).toBe(false);
  });

  it("mergePublishedThemeTokensIntoSettings leaves rows unchanged when never published", () => {
    const sf = {
      brandColor: "#111111",
      secondaryColor: null,
      backgroundColor: null,
      textColor: null,
      themePublishedJson: null,
      themePublishedAt: null,
    };
    const out = mergePublishedThemeTokensIntoSettings(sf);
    expect(out.brandColor).toBe("#111111");
  });
});

describe("navigation validation", () => {
  it("falls back to safe internal links", () => {
    const raw = {
      items: [
        { id: "1", label: "X", target: { kind: "external" as const, href: "javascript:alert(1)" } },
        { id: "2", label: "Menu", target: { kind: "menu" as const } },
      ],
    };
    const links = parseStorefrontNavigationItems(raw, "demo", { locale: "en" });
    expect(links.some((l) => l.href?.includes("javascript"))).toBe(false);
    expect(links.some((l) => l.label === "Menu")).toBe(true);
  });

  it("default fallback nav is internal", () => {
    const links = defaultFallbackNav("acme");
    expect(links[0]?.href).toBe("/s/acme");
  });
});
