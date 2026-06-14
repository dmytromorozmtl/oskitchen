import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";
import { STOREFRONT_THEME_PRESETS } from "@/lib/storefront-builder/theme-presets";

export function themePresetToSettingsPatch(presetId: string) {
  const preset = STOREFRONT_THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return null;
  const c = preset.tokens.colors;
  const typo = preset.tokens.typography;
  return {
    brandColor: c.accent || c.primary,
    secondaryColor: c.secondary,
    backgroundColor: c.background,
    textColor: c.text,
    themePreset: preset.id as ThemePresetId,
    layoutPreset: preset.tokens.layout.containerWidth === "72rem" ? "wide" : "default",
    fontFamily: `${typo.headingFont}, ${typo.bodyFont}, system-ui, sans-serif`,
  };
}
