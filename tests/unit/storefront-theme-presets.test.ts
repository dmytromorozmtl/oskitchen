import { describe, expect, it } from "vitest";

import { THEME_PRESETS, activeThemePresetId, themeMatchesPreset } from "@/lib/storefront/theme-presets";

describe("storefront theme presets", () => {
  it("exposes five curated presets", () => {
    expect(Object.keys(THEME_PRESETS)).toHaveLength(5);
  });

  it("detects active preset after apply", () => {
    const minimal = THEME_PRESETS.minimal.theme;
    expect(themeMatchesPreset(minimal, minimal)).toBe(true);
    expect(activeThemePresetId(minimal)).toBe("minimal");
  });

  it("returns null when theme is customized", () => {
    const custom = { ...THEME_PRESETS.bold.theme, accentColor: "#ABCDEF" };
    expect(activeThemePresetId(custom)).toBeNull();
  });
});
