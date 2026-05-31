export const SHOPIFY_MARKETS_HEALTH_DASHBOARD_HONESTY =
  "Health score reflects cached sync state — run full reconcile to refresh prices, catalog, tax, hostname, B2B companies, and webhook registry in one pass.";

export const SHOPIFY_MARKETS_DISCOVERY_STALE_MS = 7 * 24 * 60 * 60 * 1000;

export function isShopifyMarketsHealthDashboardEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_HEALTH_DASHBOARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export type MarketsHealthLevel = "healthy" | "attention" | "critical";

export type MarketsHealthDomainKey =
  | "discovery"
  | "prices"
  | "catalog"
  | "tax"
  | "hostname"
  | "webhooks"
  | "b2b";

export type MarketsHealthDomainStatus = {
  key: MarketsHealthDomainKey;
  label: string;
  level: MarketsHealthLevel;
  summary: string;
  lastActivityAt: string | null;
  openIssues: number;
  linkHref: string;
};

export type ShopifyMarketsHealthSnapshot = {
  computedAt: string;
  overallLevel: MarketsHealthLevel;
  overallScore: number;
  shopifyConnected: boolean;
  linkedMarkets: number;
  totalMarkets: number;
  syncModeSummary: {
    import: number;
    push: number;
    bidirectional: number;
    none: number;
  };
  domains: MarketsHealthDomainStatus[];
  openPriceConflicts: number;
  openCatalogConflicts: number;
  openTaxConflicts: number;
  openHostnameConflicts: number;
  openB2bConflicts: number;
  webhookDriftCount: number;
  recommendations: string[];
};

export function levelFromScore(score: number): MarketsHealthLevel {
  if (score >= 85) return "healthy";
  if (score >= 60) return "attention";
  return "critical";
}

export function healthLevelLabel(level: MarketsHealthLevel): string {
  switch (level) {
    case "healthy":
      return "Healthy";
    case "attention":
      return "Needs attention";
    case "critical":
      return "Critical";
    default:
      return level;
  }
}

export function isTimestampStale(iso: string | null, maxAgeMs: number, now?: number): boolean {
  if (!iso) return true;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return true;
  return (now ?? Date.now()) - ms > maxAgeMs;
}

export function computeMarketsHealthScore(input: {
  openPriceConflicts: number;
  openCatalogConflicts: number;
  openTaxConflicts: number;
  openHostnameConflicts: number;
  openB2bConflicts: number;
  webhookMissingOrWrong: number;
  webhookStaleOrNever: number;
  discoveryError: boolean;
  linkedMarketsWithoutDiscovery: boolean;
  discoveryStale: boolean;
  b2bUnavailable: boolean;
}): number {
  let score = 100;

  score -= Math.min(input.openPriceConflicts * 20, 40);
  score -= Math.min(input.openCatalogConflicts * 20, 40);
  score -= Math.min(input.openTaxConflicts * 10, 20);
  score -= Math.min(input.openHostnameConflicts * 10, 20);
  score -= Math.min(input.openB2bConflicts * 8, 16);
  score -= Math.min(input.webhookMissingOrWrong * 15, 30);
  score -= Math.min(input.webhookStaleOrNever * 5, 15);

  if (input.discoveryError) score -= 25;
  if (input.linkedMarketsWithoutDiscovery) score -= 15;
  if (input.discoveryStale) score -= 5;
  if (input.b2bUnavailable) score -= 3;

  return Math.max(0, Math.min(100, score));
}

export function overallLevelFromDomains(domains: MarketsHealthDomainStatus[]): MarketsHealthLevel {
  if (domains.some((d) => d.level === "critical")) return "critical";
  if (domains.some((d) => d.level === "attention")) return "attention";
  return "healthy";
}
