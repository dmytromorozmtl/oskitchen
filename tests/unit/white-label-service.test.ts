import { describe, expect, it } from "vitest";

import {
  buildBrandedManifest,
  normalizeThemeColor,
  PWA_COLOR_PRESETS,
} from "@/services/branding/white-label-service";

describe("white-label-service", () => {
  it("normalizes short hex colors", () => {
    expect(normalizeThemeColor("#f5f")).toBe("#FF55FF");
    expect(normalizeThemeColor("invalid")).toBe("#FF5F1F");
  });

  it("builds scoped manifest for storefront slug", () => {
    const manifest = buildBrandedManifest({
      storeSlug: "demo-bistro",
      restaurantName: "Demo Bistro",
      logoUrl: "https://cdn.example/logo.png",
      themeColor: PWA_COLOR_PRESETS[0].hex,
    });
    expect(manifest.start_url).toBe("/s/demo-bistro");
    expect(manifest.scope).toBe("/s/demo-bistro");
    expect(manifest.short_name).toBe("Demo Bistro");
    expect(manifest.icons[0]?.src).toContain("logo.png");
  });

  it("omits OS Kitchen from description when white-label hide is on", () => {
    const manifest = buildBrandedManifest({
      storeSlug: "x",
      restaurantName: "Hidden Brand",
      logoUrl: null,
      themeColor: "#000000",
      hideKitchenOsBranding: true,
    });
    expect(manifest.description).not.toContain("OS Kitchen");
  });
});
