import { BRAND_ACCENT, BRAND_ACCENT_DARK } from "@/lib/constants";
import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";

export type StorefrontThemePresetId = "minimal" | "bold" | "elegant" | "dark" | "rustic";

export type StorefrontThemePresetDefinition = {
  id: StorefrontThemePresetId;
  name: string;
  description: string;
  /** CSS gradient swatch for picker UI */
  swatch: string;
  theme: ThemeCustomizerState;
};

export const THEME_PRESETS: Record<StorefrontThemePresetId, StorefrontThemePresetDefinition> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean, modern, lots of white space",
    swatch: "linear-gradient(135deg, #FF5F1F 0%, #FFE8D9 100%)",
    theme: {
      accentColor: BRAND_ACCENT,
      secondaryColor: BRAND_ACCENT_DARK,
      fontFamily: "DM Sans",
      borderRadius: "12px",
      buttonStyle: "rounded-full",
      heroLayout: "centered",
      cardStyle: "shadow-sm",
      navStyle: "sticky",
    },
  },
  bold: {
    id: "bold",
    name: "Bold",
    description: "Strong typography, high contrast",
    swatch: "linear-gradient(135deg, #DC2626 0%, #1F2937 100%)",
    theme: {
      accentColor: "#DC2626",
      secondaryColor: "#991B1B",
      fontFamily: "Space Grotesk",
      borderRadius: "4px",
      buttonStyle: "rounded-none",
      heroLayout: "split",
      cardStyle: "shadow-md",
      navStyle: "sticky",
    },
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    description: "Serif fonts, gold accents, luxury feel",
    swatch: "linear-gradient(135deg, #B8860B 0%, #FEF3C7 100%)",
    theme: {
      accentColor: "#B8860B",
      secondaryColor: "#7C6800",
      fontFamily: "Playfair Display",
      borderRadius: "16px",
      buttonStyle: "rounded-full",
      heroLayout: "image-first",
      cardStyle: "shadow-md",
      navStyle: "static",
    },
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    description: "Dark background, vibrant accents",
    swatch: "linear-gradient(135deg, #818CF8 0%, #0F172A 100%)",
    theme: {
      accentColor: "#818CF8",
      secondaryColor: "#4F46E5",
      fontFamily: "DM Sans",
      borderRadius: "8px",
      buttonStyle: "rounded-lg",
      heroLayout: "centered",
      cardStyle: "shadow-md",
      navStyle: "sticky",
    },
  },
  rustic: {
    id: "rustic",
    name: "Rustic",
    description: "Warm earth tones, farm-to-table feel",
    swatch: "linear-gradient(135deg, #92400E 0%, #FEF3C7 100%)",
    theme: {
      accentColor: "#92400E",
      secondaryColor: "#78350F",
      fontFamily: "Inter",
      borderRadius: "12px",
      buttonStyle: "rounded-full",
      heroLayout: "centered",
      cardStyle: "shadow-sm",
      navStyle: "sticky",
    },
  },
};

export const THEME_PRESET_LIST = Object.values(THEME_PRESETS);

export function themeMatchesPreset(theme: ThemeCustomizerState, preset: ThemeCustomizerState): boolean {
  return (
    theme.accentColor.toLowerCase() === preset.accentColor.toLowerCase() &&
    theme.secondaryColor.toLowerCase() === preset.secondaryColor.toLowerCase() &&
    theme.fontFamily === preset.fontFamily &&
    theme.borderRadius === preset.borderRadius &&
    theme.buttonStyle === preset.buttonStyle &&
    theme.heroLayout === preset.heroLayout &&
    theme.cardStyle === preset.cardStyle &&
    theme.navStyle === preset.navStyle
  );
}

export function activeThemePresetId(theme: ThemeCustomizerState): StorefrontThemePresetId | null {
  for (const preset of THEME_PRESET_LIST) {
    if (themeMatchesPreset(theme, preset.theme)) return preset.id;
  }
  return null;
}
