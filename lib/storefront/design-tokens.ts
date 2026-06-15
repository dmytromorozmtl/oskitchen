import type { DesignTokens } from "@/lib/storefront-builder/design-tokens";
import { DEFAULT_DESIGN_TOKENS, mergeDesignTokensFromSettings } from "@/lib/storefront-builder/design-tokens";

export type StorefrontColorFields = {
  brandColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  themePreset?: string | null;
};

/** Build design tokens from persisted storefront colors (preset-aware merge). */
export function buildPublicStorefrontDesignTokens(settings: StorefrontColorFields): DesignTokens {
  return mergeDesignTokensFromSettings(DEFAULT_DESIGN_TOKENS, settings);
}

export { DEFAULT_DESIGN_TOKENS };
