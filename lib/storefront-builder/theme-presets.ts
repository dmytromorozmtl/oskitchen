import type { DesignTokenColors, DesignTokenComponents, DesignTokenLayout, DesignTokenTypography, DesignTokens } from "@/lib/storefront-builder/design-tokens";
import { DEFAULT_DESIGN_TOKENS } from "@/lib/storefront-builder/design-tokens";
import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";

export type StorefrontThemePresetDefinition = {
  id: ThemePresetId;
  name: string;
  description: string;
  tokens: DesignTokens;
};

function t(partial: {
  colors?: Partial<DesignTokenColors>;
  typography?: Partial<DesignTokenTypography>;
  layout?: Partial<DesignTokenLayout>;
  components?: Partial<DesignTokenComponents>;
}): DesignTokens {
  return {
    colors: { ...DEFAULT_DESIGN_TOKENS.colors, ...partial.colors },
    typography: { ...DEFAULT_DESIGN_TOKENS.typography, ...partial.typography },
    layout: { ...DEFAULT_DESIGN_TOKENS.layout, ...partial.layout },
    components: { ...DEFAULT_DESIGN_TOKENS.components, ...partial.components },
  };
}

/** Eight curated presets — food-business oriented; public renderer can adopt gradually via CSS variables. */
export const STOREFRONT_THEME_PRESETS: StorefrontThemePresetDefinition[] = [
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    description: "Clean whitespace, cool neutrals, editorial headings.",
    tokens: t({
      colors: { primary: "#111827", secondary: "#6b7280", accent: "#2563eb", background: "#fafafa", surface: "#ffffff", text: "#111827", muted: "#6b7280", border: "#e5e7eb", success: "#16a34a", warning: "#ca8a04", error: "#dc2626", buttonBg: "#111827", buttonText: "#ffffff" },
      components: { headerStyle: "left_logo", footerStyle: "minimal", heroStyle: "text_first", buttonStyle: "solid", productCardStyle: "bordered" },
    }),
  },
  {
    id: "warm_bakery",
    name: "Warm Bakery",
    description: "Cream surfaces, warm brown accent, soft radii.",
    tokens: t({
      colors: { primary: "#92400e", secondary: "#a16207", accent: "#d97706", background: "#fffbeb", surface: "#ffffff", text: "#422006", muted: "#78716c", border: "#e7e5e4", success: "#15803d", warning: "#b45309", error: "#b91c1c", buttonBg: "#92400e", buttonText: "#fffbeb" },
      layout: { cardRadius: "1.25rem", buttonRadius: "0.75rem" },
      components: { heroStyle: "banner", productCardStyle: "elevated" },
    }),
  },
  {
    id: "premium_catering",
    name: "Premium Catering",
    description: "Deep navy, gold accent, wide container.",
    tokens: t({
      colors: { primary: "#0f172a", secondary: "#334155", accent: "#c59d5f", background: "#f8fafc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", border: "#cbd5e1", success: "#15803d", warning: "#a16207", error: "#b91c1c", buttonBg: "#0f172a", buttonText: "#f8fafc" },
      layout: { containerWidth: "72rem", sectionSpacing: "3rem" },
      components: { headerStyle: "split", footerStyle: "columns" },
    }),
  },
  {
    id: "fresh_meal_prep",
    name: "Fresh Meal Prep",
    description: "Mint accent, crisp white cards, sporty rhythm.",
    tokens: t({
      colors: { primary: "#0d9488", secondary: "#14b8a6", accent: "#22c55e", background: "#ecfdf5", surface: "#ffffff", text: "#042f2e", muted: "#64748b", border: "#ccfbf1", success: "#16a34a", warning: "#ca8a04", error: "#dc2626", buttonBg: "#0d9488", buttonText: "#ffffff" },
      components: { productCardStyle: "flat", buttonStyle: "solid" },
    }),
  },
  {
    id: "cafe_classic",
    name: "Café Classic",
    description: "Espresso + paper cream, subtle borders.",
    tokens: t({
      colors: { primary: "#431407", secondary: "#57534e", accent: "#ea580c", background: "#faf7f2", surface: "#ffffff", text: "#1c1917", muted: "#78716c", border: "#e7e5e4", success: "#15803d", warning: "#b45309", error: "#b91c1c", buttonBg: "#431407", buttonText: "#faf7f2" },
      typography: { headingWeight: 700 },
    }),
  },
  {
    id: "ghost_kitchen_dark",
    name: "Ghost Kitchen Dark",
    description: "Dark surface, neon accent, high contrast CTAs.",
    tokens: t({
      colors: { primary: "#22d3ee", secondary: "#94a3b8", accent: "#a78bfa", background: "#020617", surface: "#0f172a", text: "#f8fafc", muted: "#94a3b8", border: "#1e293b", success: "#4ade80", warning: "#fbbf24", error: "#f87171", buttonBg: "#22d3ee", buttonText: "#020617" },
      components: { headerStyle: "left_logo", footerStyle: "minimal", heroStyle: "split" },
    }),
  },
  {
    id: "organic_market",
    name: "Organic Market",
    description: "Earthy greens, paper texture background.",
    tokens: t({
      colors: { primary: "#166534", secondary: "#3f6212", accent: "#84cc16", background: "#f7fee7", surface: "#ffffff", text: "#14532d", muted: "#4d7c0f", border: "#d9f99d", success: "#15803d", warning: "#a16207", error: "#b91c1c", buttonBg: "#166534", buttonText: "#f7fee7" },
    }),
  },
  {
    id: "bold_restaurant",
    name: "Bold Restaurant",
    description: "High-energy red accent, strong typography.",
    tokens: t({
      colors: { primary: "#b91c1c", secondary: "#991b1b", accent: "#f97316", background: "#fff7ed", surface: "#ffffff", text: "#431407", muted: "#78716c", border: "#fed7aa", success: "#15803d", warning: "#b45309", error: "#7f1d1d", buttonBg: "#b91c1c", buttonText: "#ffffff" },
      typography: { headingWeight: 700, fontScale: 1.05 },
      components: { buttonStyle: "solid", productCardStyle: "elevated" },
    }),
  },
];

export function getThemePresetById(id: string | null | undefined): StorefrontThemePresetDefinition | null {
  if (!id?.trim()) return null;
  return STOREFRONT_THEME_PRESETS.find((p) => p.id === id) ?? null;
}
