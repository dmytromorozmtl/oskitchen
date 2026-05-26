import type { KitchenOperatingMode } from "@prisma/client";

import type { OperatingModelId } from "@/lib/onboarding/onboarding-types";
import { OPERATING_MODE_CONFIGS, type OperatingMode, type OperatingModeConfig } from "./types";

/**
 * Maps business type to the high-level operating mode (weekly batch vs daily service).
 */
export function getOperatingModeForBusinessType(businessType: string | null | undefined): OperatingMode {
  if (
    businessType &&
    OPERATING_MODE_CONFIGS.DAILY_SERVICE.applicableBusinessTypes.includes(businessType)
  ) {
    return "DAILY_SERVICE";
  }
  return "WEEKLY_PREORDER";
}

export function getOperatingModeConfig(mode: OperatingMode): OperatingModeConfig {
  return OPERATING_MODE_CONFIGS[mode];
}

export function getConfigForBusinessType(businessType: string | null | undefined): OperatingModeConfig {
  return getOperatingModeConfig(getOperatingModeForBusinessType(businessType));
}

export function isDailyServiceMode(mode: OperatingMode | KitchenOperatingMode | null | undefined): boolean {
  return mode === "DAILY_SERVICE";
}

/** Sync persisted mode from detailed onboarding operating model selection. */
export function operatingModeFromOperatingModelId(
  operatingModel: OperatingModelId | null | undefined,
): OperatingMode {
  if (!operatingModel) return "WEEKLY_PREORDER";
  switch (operatingModel) {
    case "WEEKLY_PREORDERS":
    case "BAKERY_CUSTOM_PREORDERS":
    case "STOREFRONT":
      return "WEEKLY_PREORDER";
    default:
      return "DAILY_SERVICE";
  }
}

export function toPrismaOperatingMode(mode: OperatingMode): KitchenOperatingMode {
  return mode as KitchenOperatingMode;
}
