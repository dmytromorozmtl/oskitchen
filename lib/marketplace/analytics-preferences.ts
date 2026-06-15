function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type MarketplaceAnalyticsSettings = {
  monthlyBudgetUsd: number | null;
};

export const DEFAULT_MARKETPLACE_ANALYTICS_SETTINGS: MarketplaceAnalyticsSettings = {
  monthlyBudgetUsd: null,
};

export function parseMarketplaceAnalyticsSettings(raw: unknown): MarketplaceAnalyticsSettings {
  if (!isPlainObject(raw)) return { ...DEFAULT_MARKETPLACE_ANALYTICS_SETTINGS };
  const budget = raw.monthlyBudgetUsd;
  if (typeof budget === "number" && Number.isFinite(budget) && budget > 0) {
    return { monthlyBudgetUsd: budget };
  }
  if (typeof budget === "string" && budget.trim()) {
    const parsed = Number(budget);
    if (Number.isFinite(parsed) && parsed > 0) return { monthlyBudgetUsd: parsed };
  }
  return { monthlyBudgetUsd: null };
}

export function marketplaceAnalyticsFromSettingsCenter(
  settingsCenterJson: unknown,
): MarketplaceAnalyticsSettings {
  if (!isPlainObject(settingsCenterJson)) {
    return { ...DEFAULT_MARKETPLACE_ANALYTICS_SETTINGS };
  }
  return parseMarketplaceAnalyticsSettings(settingsCenterJson.marketplace);
}

export function budgetAlertLevel(
  spend: number,
  budget: number | null,
): "none" | "warning" | "critical" {
  if (!budget || budget <= 0) return "none";
  const ratio = spend / budget;
  if (ratio >= 1) return "critical";
  if (ratio >= 0.85) return "warning";
  return "none";
}

export function budgetProgressPercent(spend: number, budget: number | null): number | null {
  if (!budget || budget <= 0) return null;
  return Math.min(100, Math.round((spend / budget) * 1000) / 10);
}
