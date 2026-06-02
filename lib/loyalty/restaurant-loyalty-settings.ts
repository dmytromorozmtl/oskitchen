export type LoyaltyTierRule = {
  name: string;
  minLifetimePoints: number;
  multiplier: number;
};

export type ItemBonusRule = {
  titleContains?: string;
  productId?: string;
  bonusPoints: number;
};

export type RestaurantLoyaltyConfig = {
  enabled: boolean;
  visitRewardEvery: number;
  visitRewardPoints: number;
  itemBonuses: ItemBonusRule[];
  tiers: LoyaltyTierRule[];
  /** Loyalty 2.0 — birthday reward (MM-DD match in customer tagsJson.birthday). */
  birthdayRewardEnabled: boolean;
  birthdayRewardPoints: number;
  /** Both referrer and friend earn bonus when friend completes first order. */
  referralBonusEnabled: boolean;
  referralBonusPoints: number;
  /** e.g. every 10th visit with matching item → free item reward note. */
  visitFreeItemEvery: number;
  visitFreeItemTitleContains: string;
};

/** Loyalty 2.0 tier ladder — Silver / Gold / Platinum lifetime points. */
export const LOYALTY_2_TIER_LADDER: LoyaltyTierRule[] = [
  { name: "SILVER", minLifetimePoints: 0, multiplier: 1 },
  { name: "GOLD", minLifetimePoints: 501, multiplier: 1.15 },
  { name: "PLATINUM", minLifetimePoints: 2001, multiplier: 1.3 },
];

export const DEFAULT_RESTAURANT_LOYALTY_TIERS: LoyaltyTierRule[] = LOYALTY_2_TIER_LADDER;

export const DEFAULT_RESTAURANT_LOYALTY_CONFIG: RestaurantLoyaltyConfig = {
  enabled: true,
  visitRewardEvery: 10,
  visitRewardPoints: 0,
  itemBonuses: [
    { titleContains: "espresso", bonusPoints: 5 },
    { titleContains: "latte", bonusPoints: 10 },
  ],
  tiers: LOYALTY_2_TIER_LADDER,
  birthdayRewardEnabled: true,
  birthdayRewardPoints: 100,
  referralBonusEnabled: true,
  referralBonusPoints: 50,
  visitFreeItemEvery: 10,
  visitFreeItemTitleContains: "coffee",
};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function parseItemBonus(raw: unknown): ItemBonusRule | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const bonusPoints = Math.round(num(o.bonusPoints, 0));
  if (bonusPoints <= 0) return null;
  const titleContains = typeof o.titleContains === "string" ? o.titleContains.trim() : undefined;
  const productId = typeof o.productId === "string" ? o.productId.trim() : undefined;
  if (!titleContains && !productId) return null;
  return { titleContains, productId, bonusPoints };
}

function parseTier(raw: unknown): LoyaltyTierRule | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim().toUpperCase() : "";
  if (!name) return null;
  return {
    name,
    minLifetimePoints: Math.max(0, Math.round(num(o.minLifetimePoints, 0))),
    multiplier: Math.max(1, num(o.multiplier, 1)),
  };
}

export function parseRestaurantLoyaltyConfig(raw: unknown): RestaurantLoyaltyConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_RESTAURANT_LOYALTY_CONFIG;
  const o = raw as Record<string, unknown>;

  const itemBonuses = Array.isArray(o.itemBonuses)
    ? o.itemBonuses.map(parseItemBonus).filter((r): r is ItemBonusRule => r != null).slice(0, 20)
    : DEFAULT_RESTAURANT_LOYALTY_CONFIG.itemBonuses;

  const tiersRaw = Array.isArray(o.tiers) ? o.tiers : [];
  const tiers = tiersRaw.map(parseTier).filter((t): t is LoyaltyTierRule => t != null);
  const sortedTiers = (tiers.length > 0 ? tiers : DEFAULT_RESTAURANT_LOYALTY_TIERS).sort(
    (a, b) => a.minLifetimePoints - b.minLifetimePoints,
  );

  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : DEFAULT_RESTAURANT_LOYALTY_CONFIG.enabled,
    visitRewardEvery: Math.max(
      0,
      Math.round(num(o.visitRewardEvery, DEFAULT_RESTAURANT_LOYALTY_CONFIG.visitRewardEvery)),
    ),
    visitRewardPoints: Math.max(
      0,
      Math.round(num(o.visitRewardPoints, DEFAULT_RESTAURANT_LOYALTY_CONFIG.visitRewardPoints)),
    ),
    itemBonuses,
    tiers: sortedTiers,
    birthdayRewardEnabled:
      typeof o.birthdayRewardEnabled === "boolean"
        ? o.birthdayRewardEnabled
        : DEFAULT_RESTAURANT_LOYALTY_CONFIG.birthdayRewardEnabled,
    birthdayRewardPoints: Math.max(
      0,
      Math.round(num(o.birthdayRewardPoints, DEFAULT_RESTAURANT_LOYALTY_CONFIG.birthdayRewardPoints)),
    ),
    referralBonusEnabled:
      typeof o.referralBonusEnabled === "boolean"
        ? o.referralBonusEnabled
        : DEFAULT_RESTAURANT_LOYALTY_CONFIG.referralBonusEnabled,
    referralBonusPoints: Math.max(
      0,
      Math.round(num(o.referralBonusPoints, DEFAULT_RESTAURANT_LOYALTY_CONFIG.referralBonusPoints)),
    ),
    visitFreeItemEvery: Math.max(
      0,
      Math.round(num(o.visitFreeItemEvery, DEFAULT_RESTAURANT_LOYALTY_CONFIG.visitFreeItemEvery)),
    ),
    visitFreeItemTitleContains:
      typeof o.visitFreeItemTitleContains === "string"
        ? o.visitFreeItemTitleContains.trim()
        : DEFAULT_RESTAURANT_LOYALTY_CONFIG.visitFreeItemTitleContains,
  };
}

export function restaurantLoyaltyFromSettingsCenter(settingsCenterJson: unknown): RestaurantLoyaltyConfig {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return DEFAULT_RESTAURANT_LOYALTY_CONFIG;
  }
  const loyalty = (settingsCenterJson as Record<string, unknown>).loyalty;
  if (!loyalty || typeof loyalty !== "object") return DEFAULT_RESTAURANT_LOYALTY_CONFIG;
  return parseRestaurantLoyaltyConfig((loyalty as Record<string, unknown>).restaurant);
}

export function mergeRestaurantLoyaltyIntoSettingsCenter(
  settingsCenterJson: unknown,
  config: RestaurantLoyaltyConfig,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const loyalty =
    base.loyalty && typeof base.loyalty === "object"
      ? { ...(base.loyalty as Record<string, unknown>) }
      : {};
  loyalty.restaurant = config;
  base.loyalty = loyalty;
  return base;
}
