import type { CSSProperties } from "react";

import type { DesignTokens } from "@/lib/storefront-builder/design-tokens";
import { designTokensToCssVars as mapTokens } from "@/lib/storefront-builder/design-tokens";
import type { ThemePresetId } from "@/lib/storefront-builder/theme-types";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isLikelyHexColor(v: string): boolean {
  return HEX.test(v.trim());
}

/** Safe CSS var map for storefront shell — invalid colors fall back inside merge step upstream. */
export function storefrontDesignTokensToCssVarsStyle(
  tokens: DesignTokens,
  presetId: ThemePresetId = "modern_minimal",
): CSSProperties {
  const flat = mapTokens(tokens, presetId) as Record<string, string>;
  const style: Record<string, string> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (typeof v === "string" && v.length > 0 && v.length < 500) {
      style[k] = v;
    }
  }
  return style as CSSProperties;
}
