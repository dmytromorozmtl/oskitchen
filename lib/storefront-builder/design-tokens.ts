import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";

export type DesignTokenColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  buttonBg: string;
  buttonText: string;
};

export type DesignTokenTypography = {
  headingFont: string;
  bodyFont: string;
  fontScale: number;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
  letterSpacing: string;
};

export type DesignTokenLayout = {
  containerWidth: string;
  sectionSpacing: string;
  cardRadius: string;
  buttonRadius: string;
  imageRadius: string;
};

export type DesignTokenComponents = {
  buttonStyle: "solid" | "outline" | "ghost";
  productCardStyle: "flat" | "elevated" | "bordered";
  headerStyle: "left_logo" | "center_logo" | "split";
  footerStyle: "simple" | "columns" | "minimal";
  heroStyle: "banner" | "split" | "text_first";
};

export type DesignTokens = {
  colors: DesignTokenColors;
  typography: DesignTokenTypography;
  layout: DesignTokenLayout;
  components: DesignTokenComponents;
};

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: "#286ab8",
    secondary: "#64748b",
    accent: "#0ea5e9",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    success: "#16a34a",
    warning: "#ca8a04",
    error: "#dc2626",
    buttonBg: "#286ab8",
    buttonText: "#ffffff",
  },
  typography: {
    headingFont: "ui-sans-serif, system-ui, sans-serif",
    bodyFont: "ui-sans-serif, system-ui, sans-serif",
    fontScale: 1,
    headingWeight: 600,
    bodyWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0",
  },
  layout: {
    containerWidth: "56rem",
    sectionSpacing: "2.5rem",
    cardRadius: "1rem",
    buttonRadius: "9999px",
    imageRadius: "0.75rem",
  },
  components: {
    buttonStyle: "solid",
    productCardStyle: "elevated",
    headerStyle: "left_logo",
    footerStyle: "simple",
    heroStyle: "banner",
  },
};

type SettingsLike = {
  brandColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  themePreset?: string | null;
};

function nz(v: string | null | undefined, fallback: string) {
  const t = v?.trim();
  return t && t.length > 0 ? t : fallback;
}

/** Merge persisted storefront colors into token palette (presets fill the rest). */
export function mergeDesignTokensFromSettings(
  base: DesignTokens,
  settings: SettingsLike,
): DesignTokens {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: nz(settings.brandColor, base.colors.primary),
      secondary: nz(settings.secondaryColor, base.colors.secondary),
      background: nz(settings.backgroundColor, base.colors.background),
      text: nz(settings.textColor, base.colors.text),
      buttonBg: nz(settings.brandColor, base.colors.buttonBg),
      buttonText: "#ffffff",
    },
  };
}

export function designTokensToCssVars(tokens: DesignTokens, presetId: ThemePresetId): Record<string, string> {
  const { colors, typography, layout, components } = tokens;
  return {
    "--sb-preset": String(presetId),
    "--sb-color-primary": colors.primary,
    "--sb-color-secondary": colors.secondary,
    "--sb-color-accent": colors.accent,
    "--sb-color-background": colors.background,
    "--sb-color-surface": colors.surface,
    "--sb-color-text": colors.text,
    "--sb-color-muted": colors.muted,
    "--sb-color-border": colors.border,
    "--sb-font-heading": typography.headingFont,
    "--sb-font-body": typography.bodyFont,
    "--sb-container-width": layout.containerWidth,
    "--sb-section-spacing": layout.sectionSpacing,
    "--sb-radius-card": layout.cardRadius,
    "--sb-radius-button": layout.buttonRadius,
    "--sb-radius-image": layout.imageRadius,
    "--sb-button-style": components.buttonStyle,
    "--sb-product-card-style": components.productCardStyle,
  };
}
