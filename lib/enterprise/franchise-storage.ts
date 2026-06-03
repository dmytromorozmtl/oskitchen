import type { FranchiseSuiteSettings } from "@/lib/enterprise/franchise-types";
import { DEFAULT_FRANCHISE_SUITE_SETTINGS } from "@/lib/enterprise/franchise-types";

export const FRANCHISE_SUITE_STORAGE_KEY = "franchiseSuite";

export function parseFranchiseSuiteSettings(raw: unknown): FranchiseSuiteSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_FRANCHISE_SUITE_SETTINGS };
  }
  const o = raw as Record<string, unknown>;
  const brand = (o.brandControl ?? {}) as Record<string, unknown>;
  const menu = (o.menuEnforcement ?? {}) as Record<string, unknown>;

  return {
    brandControl: {
      brandName: typeof brand.brandName === "string" ? brand.brandName : null,
      logoUrl: typeof brand.logoUrl === "string" ? brand.logoUrl : null,
      brandColor: typeof brand.brandColor === "string" ? brand.brandColor : null,
      tagline: typeof brand.tagline === "string" ? brand.tagline : null,
      enforcementMode: brand.enforcementMode === "strict" ? "strict" : "guided",
    },
    menuEnforcement: {
      mode: menu.mode === "strict" ? "strict" : "guided",
      lockedMenuItems: Array.isArray(menu.lockedMenuItems)
        ? menu.lockedMenuItems.filter((x): x is string => typeof x === "string")
        : [],
      requiredItemCount:
        typeof menu.requiredItemCount === "number" && menu.requiredItemCount >= 0
          ? menu.requiredItemCount
          : 0,
    },
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export function readFranchiseSuiteSettings(settingsCenterJson: unknown): FranchiseSuiteSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object" || Array.isArray(settingsCenterJson)) {
    return { ...DEFAULT_FRANCHISE_SUITE_SETTINGS };
  }
  const raw = (settingsCenterJson as Record<string, unknown>)[FRANCHISE_SUITE_STORAGE_KEY];
  return parseFranchiseSuiteSettings(raw);
}
