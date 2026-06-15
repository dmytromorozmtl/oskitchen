import type { CSSProperties } from "react";

/** Brand CSS variables only — never inline page bg/text (breaks dark mode). */
export function buildStorefrontBrandStyle(input: {
  accent: string;
  secondary?: string | null;
}): CSSProperties {
  const style: Record<string, string> = {
    "--store-accent": input.accent,
  };
  const sec = input.secondary?.trim();
  if (sec) style["--store-secondary"] = sec;
  return style as CSSProperties;
}
