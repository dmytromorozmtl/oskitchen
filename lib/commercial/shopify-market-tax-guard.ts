import type { StorefrontTaxSettings, TaxJurisdictionMode } from "@/lib/storefront/tax-settings";

export const SHOPIFY_MARKET_TAX_GUARD_HONESTY =
  "KitchenOS checkout always uses your OS Kitchen tax settings — Shopify tax import is reference-only and never silently overwrites tax rules.";

export function isShopifyMarketsTaxGuardEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_TAX_GUARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function summarizeKitchenosTaxSettings(settings: StorefrontTaxSettings): {
  mode: TaxJurisdictionMode;
  regionCode: string | null;
  taxIncludedInPrices: boolean;
  totalRatePercent: number;
  componentSummary: string;
} {
  const totalRatePercent = settings.components.reduce((sum, c) => sum + c.ratePercent, 0);
  const componentSummary = settings.components
    .filter((c) => c.ratePercent > 0)
    .map((c) => `${c.label} ${c.ratePercent}%`)
    .join(" + ");
  return {
    mode: settings.mode,
    regionCode: settings.regionCode?.trim().toUpperCase() ?? null,
    taxIncludedInPrices: settings.taxIncludedInPrices === true,
    totalRatePercent,
    componentSummary: componentSummary || "No configured rates",
  };
}

export function inferTaxModeFromRegionCodes(regionCodes: string[]): TaxJurisdictionMode {
  const codes = regionCodes.map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (codes.some((c) => c.startsWith("US") || c === "US")) return "us_sales";
  if (codes.some((c) => c === "CA")) return "ca_sales";
  const eu = new Set([
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
    "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "EU",
  ]);
  if (codes.some((c) => eu.has(c))) return "eu_vat";
  return "single";
}

export function regionsOverlapKitchenosTax(
  shopifyRegionCodes: string[],
  kitchenRegionCode: string | null,
): boolean {
  if (!kitchenRegionCode) return true;
  const kitchen = kitchenRegionCode.trim().toUpperCase();
  const shopify = shopifyRegionCodes.map((c) => c.trim().toUpperCase());
  if (shopify.includes(kitchen)) return true;
  if (kitchen === "EU" && shopify.some((c) => c.length === 2)) return true;
  if (kitchen.startsWith("US") && shopify.some((c) => c === "US" || c.startsWith("US-"))) return true;
  if (kitchen === "CA" && shopify.includes("CA")) return true;
  return false;
}
