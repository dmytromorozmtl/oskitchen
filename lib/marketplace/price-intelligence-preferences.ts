import {
  PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT,
} from "@/lib/marketplace/price-intelligence-policy";
import type { PriceIntelligenceAutoSwitchPolicy } from "@/lib/marketplace/price-intelligence-types";

export const PRICE_INTELLIGENCE_SETTINGS_KEY = "priceIntelligence" as const;

export const DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH: PriceIntelligenceAutoSwitchPolicy = {
  enabled: false,
  minSavingsPercent: PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePriceIntelligenceAutoSwitch(raw: unknown): PriceIntelligenceAutoSwitchPolicy {
  if (!isPlainObject(raw)) return { ...DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH };
  const minSavingsPercent =
    typeof raw.minSavingsPercent === "number" && raw.minSavingsPercent > 0
      ? Math.round(raw.minSavingsPercent)
      : DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH.minSavingsPercent;
  return {
    enabled: raw.enabled === true,
    minSavingsPercent,
  };
}

export function priceIntelligenceFromSettingsCenter(settingsCenterJson: unknown): PriceIntelligenceAutoSwitchPolicy {
  if (!isPlainObject(settingsCenterJson)) {
    return { ...DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH };
  }
  return parsePriceIntelligenceAutoSwitch(settingsCenterJson[PRICE_INTELLIGENCE_SETTINGS_KEY]);
}

export function mergePriceIntelligenceIntoSettingsCenter(
  settingsCenterJson: unknown,
  policy: PriceIntelligenceAutoSwitchPolicy,
): Record<string, unknown> {
  const root = isPlainObject(settingsCenterJson) ? { ...settingsCenterJson } : {};
  root[PRICE_INTELLIGENCE_SETTINGS_KEY] = policy;
  return root;
}
