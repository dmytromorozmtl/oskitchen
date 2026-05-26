import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";
import { DEFAULT_DESIGN_TOKENS, mergeDesignTokensFromSettings, designTokensToCssVars, type DesignTokens } from "@/lib/storefront-builder/design-tokens";
import { STOREFRONT_THEME_PRESETS, getThemePresetById } from "@/lib/storefront-builder/theme-presets";

type SettingsLike = Parameters<typeof mergeDesignTokensFromSettings>[1];

export function listThemePresets() {
  return STOREFRONT_THEME_PRESETS;
}

export function resolveDesignTokensForStorefront(settings: SettingsLike): {
  tokens: DesignTokens;
  presetId: ThemePresetId;
  cssVars: Record<string, string>;
} {
  const preset = getThemePresetById(settings.themePreset ?? undefined);
  const base = preset?.tokens ?? DEFAULT_DESIGN_TOKENS;
  const merged = mergeDesignTokensFromSettings(base, settings);
  const presetId = (settings.themePreset as ThemePresetId) || "modern_minimal";
  return { tokens: merged, presetId, cssVars: designTokensToCssVars(merged, presetId) };
}
