import { BRAND_ACCENT, BRAND_ACCENT_DARK } from "@/lib/constants";
import { asJsonRecord } from "@/lib/prisma/json";

export type ThemeCustomizerState = {
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "rounded-full" | "rounded-lg" | "rounded-none";
  heroLayout: "centered" | "split" | "image-first";
  cardStyle: "shadow-sm" | "shadow-md" | "bordered";
  navStyle: "sticky" | "static";
};

export type StorefrontSeoSocial = {
  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
};

export type ThemeDraftPayload = {
  customizer?: Partial<ThemeCustomizerState>;
  customCss?: string | null;
  seoSocial?: StorefrontSeoSocial;
};

const DEFAULT_CUSTOMIZER: ThemeCustomizerState = {
  accentColor: BRAND_ACCENT,
  secondaryColor: BRAND_ACCENT_DARK,
  fontFamily: "DM Sans",
  borderRadius: "12px",
  buttonStyle: "rounded-full",
  heroLayout: "centered",
  cardStyle: "shadow-sm",
  navStyle: "sticky",
};

export function parseThemeDraft(raw: unknown): ThemeDraftPayload {
  const j = asJsonRecord(raw);
  if (!j) return {};
  return {
    customizer: (j.customizer as Partial<ThemeCustomizerState>) ?? undefined,
    customCss: typeof j.customCss === "string" ? j.customCss : null,
    seoSocial: (j.seoSocial as StorefrontSeoSocial) ?? undefined,
  };
}

export function resolveThemeCustomizer(
  draft: ThemeDraftPayload,
  settings: {
    brandColor?: string | null;
    secondaryColor?: string | null;
    fontFamily?: string | null;
    layoutPreset?: string | null;
  },
): ThemeCustomizerState {
  const c = draft.customizer ?? {};
  const layout = (settings.layoutPreset ?? "").trim();
  let heroLayout: ThemeCustomizerState["heroLayout"] = "centered";
  if (layout.includes("split")) heroLayout = "split";
  else if (layout.includes("image")) heroLayout = "image-first";

  return {
    accentColor: c.accentColor?.trim() || settings.brandColor?.trim() || DEFAULT_CUSTOMIZER.accentColor,
    secondaryColor: c.secondaryColor?.trim() || settings.secondaryColor?.trim() || DEFAULT_CUSTOMIZER.secondaryColor,
    fontFamily: c.fontFamily?.trim() || settings.fontFamily?.trim() || DEFAULT_CUSTOMIZER.fontFamily,
    borderRadius: c.borderRadius?.trim() || DEFAULT_CUSTOMIZER.borderRadius,
    buttonStyle: c.buttonStyle ?? DEFAULT_CUSTOMIZER.buttonStyle,
    heroLayout: c.heroLayout ?? heroLayout,
    cardStyle: c.cardStyle ?? DEFAULT_CUSTOMIZER.cardStyle,
    navStyle: c.navStyle ?? DEFAULT_CUSTOMIZER.navStyle,
  };
}

export function mergeThemeDraft(
  existing: unknown,
  patch: Partial<ThemeDraftPayload>,
): Record<string, unknown> {
  const base = asJsonRecord(existing) ?? {};
  return { ...base, ...patch };
}

export function customizerToCssVars(c: ThemeCustomizerState): Record<string, string> {
  return {
    "--sf-radius": c.borderRadius,
    "--sf-button-radius": c.buttonStyle === "rounded-full" ? "9999px" : c.buttonStyle === "rounded-lg" ? "0.5rem" : "0",
    "--store-accent": c.accentColor,
    "--store-secondary": c.secondaryColor,
    "--sf-card-shadow":
      c.cardStyle === "shadow-md" ? "0 12px 40px -12px rgb(0 0 0 / 0.18)" : c.cardStyle === "bordered" ? "none" : "0 1px 2px rgb(0 0 0 / 0.04)",
  };
}
