import type { CSSProperties } from "react";

/**
 * Map brand colors to inline CSS variables for embedded previews (storefront wizard, etc.).
 */
export function brandThemeStyleVars(input: {
  brandColor?: string | null;
  secondaryColor?: string | null;
}): CSSProperties {
  const primary = input.brandColor?.trim() || "#286ab8";
  const secondary = input.secondaryColor?.trim() || "#1e4f8c";
  return {
    ["--brand-primary" as string]: primary,
    ["--brand-secondary" as string]: secondary,
  };
}
