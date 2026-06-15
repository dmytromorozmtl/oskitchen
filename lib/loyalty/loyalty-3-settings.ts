import {
  LOYALTY_3_EVENT_BONUS_POINTS_DEFAULT,
  LOYALTY_3_VIP_MIN_LTV_CENTS_DEFAULT,
  LOYALTY_3_VIP_MULTIPLIER_DEFAULT,
} from "@/lib/loyalty/loyalty-3-policy";
import type { Loyalty3Config } from "@/lib/loyalty/loyalty-3-types";

export const DEFAULT_LOYALTY_3_CONFIG: Loyalty3Config = {
  crossBrandEnabled: true,
  vipMultiplier: LOYALTY_3_VIP_MULTIPLIER_DEFAULT,
  vipMinLifetimeValueCents: LOYALTY_3_VIP_MIN_LTV_CENTS_DEFAULT,
  eventBonusEnabled: true,
  eventBonusPoints: LOYALTY_3_EVENT_BONUS_POINTS_DEFAULT,
  referralLeaderboardEnabled: true,
};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function parseLoyalty3Config(raw: unknown): Loyalty3Config {
  if (!raw || typeof raw !== "object") return DEFAULT_LOYALTY_3_CONFIG;
  const o = raw as Record<string, unknown>;
  return {
    crossBrandEnabled:
      typeof o.crossBrandEnabled === "boolean"
        ? o.crossBrandEnabled
        : DEFAULT_LOYALTY_3_CONFIG.crossBrandEnabled,
    vipMultiplier: Math.max(1, num(o.vipMultiplier, DEFAULT_LOYALTY_3_CONFIG.vipMultiplier)),
    vipMinLifetimeValueCents: Math.max(
      0,
      Math.round(num(o.vipMinLifetimeValueCents, DEFAULT_LOYALTY_3_CONFIG.vipMinLifetimeValueCents)),
    ),
    eventBonusEnabled:
      typeof o.eventBonusEnabled === "boolean"
        ? o.eventBonusEnabled
        : DEFAULT_LOYALTY_3_CONFIG.eventBonusEnabled,
    eventBonusPoints: Math.max(
      0,
      Math.round(num(o.eventBonusPoints, DEFAULT_LOYALTY_3_CONFIG.eventBonusPoints)),
    ),
    referralLeaderboardEnabled:
      typeof o.referralLeaderboardEnabled === "boolean"
        ? o.referralLeaderboardEnabled
        : DEFAULT_LOYALTY_3_CONFIG.referralLeaderboardEnabled,
  };
}

export function loyalty3FromSettingsCenter(settingsCenterJson: unknown): Loyalty3Config {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return DEFAULT_LOYALTY_3_CONFIG;
  }
  const loyalty = (settingsCenterJson as Record<string, unknown>).loyalty;
  if (!loyalty || typeof loyalty !== "object") return DEFAULT_LOYALTY_3_CONFIG;
  return parseLoyalty3Config((loyalty as Record<string, unknown>).v3);
}

export function mergeLoyalty3IntoSettingsCenter(
  settingsCenterJson: unknown,
  config: Loyalty3Config,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const loyalty =
    base.loyalty && typeof base.loyalty === "object"
      ? { ...(base.loyalty as Record<string, unknown>) }
      : {};
  loyalty.v3 = config;
  base.loyalty = loyalty;
  return base;
}
