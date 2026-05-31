import type { CSSProperties } from "react";

import { BRAND_ACCENT, BRAND_ACCENT_DARK } from "@/lib/constants";

/**
 * Map brand colors to inline CSS variables for embedded previews (storefront wizard, etc.).
 */
export function brandThemeStyleVars(input: {
  brandColor?: string | null;
  secondaryColor?: string | null;
}): CSSProperties {
  const primary = input.brandColor?.trim() || BRAND_ACCENT;
  const secondary = input.secondaryColor?.trim() || BRAND_ACCENT_DARK;
  return {
    ["--brand-primary" as string]: primary,
    ["--brand-secondary" as string]: secondary,
  };
}
