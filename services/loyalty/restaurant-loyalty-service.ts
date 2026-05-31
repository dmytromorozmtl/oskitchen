import type {
  ItemBonusRule,
  LoyaltyTierRule,
  RestaurantLoyaltyConfig,
} from "@/lib/loyalty/restaurant-loyalty-settings";

export type OrderLineForLoyalty = {
  title: string | null;
  productId: string | null;
  quantity: number;
  lineTotal: number;
};

export type RestaurantLoyaltyEarnBreakdown = {
  basePoints: number;
  itemBonusPoints: number;
  tierMultiplier: number;
  tierName: string;
  tierAdjustedPoints: number;
  visitBonusPoints: number;
  totalPoints: number;
  visitCount: number;
  lifetimePointsAfter: number;
};

export function calculateBaseOrderPoints(orderTotal: number, pointsPerDollar: number): number {
  if (orderTotal <= 0 || pointsPerDollar <= 0) return 0;
  return Math.floor(orderTotal * pointsPerDollar);
}

export function calculateItemBonusPoints(
  lines: OrderLineForLoyalty[],
  itemBonuses: ItemBonusRule[],
): number {
  if (itemBonuses.length === 0 || lines.length === 0) return 0;

  let bonus = 0;
  for (const line of lines) {
    const title = (line.title ?? "").toLowerCase();
    for (const rule of itemBonuses) {
      const matches = rule.productId
        ? line.productId === rule.productId
        : rule.titleContains
          ? title.includes(rule.titleContains.toLowerCase())
          : false;
      if (matches) {
        bonus += rule.bonusPoints * Math.max(1, line.quantity);
      }
    }
  }
  return bonus;
}

export function resolveTier(
  lifetimePoints: number,
  tiers: LoyaltyTierRule[],
): LoyaltyTierRule {
  const sorted = [...tiers].sort((a, b) => b.minLifetimePoints - a.minLifetimePoints);
  for (const tier of sorted) {
    if (lifetimePoints >= tier.minLifetimePoints) return tier;
  }
  return sorted[sorted.length - 1] ?? { name: "STANDARD", minLifetimePoints: 0, multiplier: 1 };
}

export function applyTierMultiplier(points: number, tier: LoyaltyTierRule): number {
  if (points <= 0) return 0;
  return Math.floor(points * tier.multiplier);
}

export function shouldAwardVisitReward(visitCount: number, config: RestaurantLoyaltyConfig): boolean {
  if (!config.enabled) return false;
  if (config.visitRewardEvery <= 0 || config.visitRewardPoints <= 0) return false;
  return visitCount > 0 && visitCount % config.visitRewardEvery === 0;
}

export function buildRestaurantLoyaltyEarnBreakdown(params: {
  orderTotal: number;
  pointsPerDollar: number;
  lines: OrderLineForLoyalty[];
  config: RestaurantLoyaltyConfig;
  lifetimePointsBefore: number;
  visitCount: number;
}): RestaurantLoyaltyEarnBreakdown {
  const basePoints = calculateBaseOrderPoints(params.orderTotal, params.pointsPerDollar);
  const itemBonusPoints = params.config.enabled
    ? calculateItemBonusPoints(params.lines, params.config.itemBonuses)
    : 0;

  const subtotalBeforeVisit = basePoints + itemBonusPoints;
  const tier = params.config.enabled
    ? resolveTier(params.lifetimePointsBefore + subtotalBeforeVisit, params.config.tiers)
    : resolveTier(params.lifetimePointsBefore, [{ name: "STANDARD", minLifetimePoints: 0, multiplier: 1 }]);

  const tierAdjustedPoints = params.config.enabled
    ? applyTierMultiplier(subtotalBeforeVisit, tier)
    : subtotalBeforeVisit;

  const visitBonusPoints =
    params.config.enabled && shouldAwardVisitReward(params.visitCount, params.config)
      ? params.config.visitRewardPoints
      : 0;

  const totalPoints = tierAdjustedPoints + visitBonusPoints;

  return {
    basePoints,
    itemBonusPoints,
    tierMultiplier: tier.multiplier,
    tierName: tier.name,
    tierAdjustedPoints,
    visitBonusPoints,
    totalPoints,
    visitCount: params.visitCount,
    lifetimePointsAfter: params.lifetimePointsBefore + totalPoints,
  };
}

export function formatEarnNotes(breakdown: RestaurantLoyaltyEarnBreakdown, orderTotal: number): string {
  const parts = [`Order $${orderTotal.toFixed(2)}`];
  if (breakdown.itemBonusPoints > 0) parts.push(`+${breakdown.itemBonusPoints} item bonus`);
  if (breakdown.tierMultiplier > 1) parts.push(`${breakdown.tierName} ${breakdown.tierMultiplier}x`);
  if (breakdown.visitBonusPoints > 0) {
    parts.push(`+${breakdown.visitBonusPoints} visit #${breakdown.visitCount} reward`);
  }
  parts.push(`= ${breakdown.totalPoints} pts`);
  return parts.join(" · ");
}
