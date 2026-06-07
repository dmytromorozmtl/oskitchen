export {
  STOREFRONT_THEME_PRESETS,
  getThemePresetById,
  type StorefrontThemePresetDefinition,
} from "@/lib/storefront-builder/theme-presets";

import { STOREFRONT_THEME_PRESETS } from "@/lib/storefront-builder/theme-presets";

export function listThemePresets() {
  return STOREFRONT_THEME_PRESETS;
}
