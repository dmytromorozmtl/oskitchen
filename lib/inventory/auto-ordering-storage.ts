import type { AutoOrderingSettings } from "@/lib/inventory/auto-ordering-types";
import { DEFAULT_AUTO_ORDERING_SETTINGS } from "@/lib/inventory/auto-ordering-types";

export const AUTO_ORDERING_STORAGE_KEY = "inventoryAutoOrdering";

export function parseAutoOrderingSettings(raw: unknown): AutoOrderingSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_AUTO_ORDERING_SETTINGS };
  }
  const o = raw as Record<string, unknown>;
  return {
    enabled: o.enabled === true,
    useWeatherSignals: o.useWeatherSignals !== false,
    useHolidaySignals: o.useHolidaySignals !== false,
    useTrendSignals: o.useTrendSignals !== false,
    minConfidence:
      typeof o.minConfidence === "number" && o.minConfidence >= 0 && o.minConfidence <= 1
        ? o.minConfidence
        : DEFAULT_AUTO_ORDERING_SETTINGS.minConfidence,
    lastRunAt: typeof o.lastRunAt === "string" ? o.lastRunAt : null,
  };
}

export function readAutoOrderingSettings(settingsCenterJson: unknown): AutoOrderingSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object" || Array.isArray(settingsCenterJson)) {
    return { ...DEFAULT_AUTO_ORDERING_SETTINGS };
  }
  const raw = (settingsCenterJson as Record<string, unknown>)[AUTO_ORDERING_STORAGE_KEY];
  return parseAutoOrderingSettings(raw);
}
