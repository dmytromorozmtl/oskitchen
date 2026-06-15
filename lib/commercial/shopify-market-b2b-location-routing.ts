export const SHOPIFY_MARKET_B2B_LOCATION_ROUTING_HONESTY =
  "B2B location routing suggests OS Kitchen markets from ship-to country — never changes storefront DNS or creates markets automatically unless b2bLocationAuthority is shopify.";

export function isShopifyMarketsB2bLocationRoutingEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_LOCATION_ROUTING === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/** REST Admin numeric id → Shopify GID tail for Company / CompanyLocation. */
export function shopifyAdminGid(resource: "Company" | "CompanyLocation", id: string | number): string {
  const numeric = String(id).trim();
  if (!numeric) return "";
  return `gid://shopify/${resource}/${numeric}`;
}

export function normalizeCountryCode(code: string | null | undefined): string | null {
  const trimmed = code?.trim().toUpperCase() ?? "";
  return trimmed.length >= 2 ? trimmed.slice(0, 2) : null;
}

export function countryCodesMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = normalizeCountryCode(a);
  const right = normalizeCountryCode(b);
  if (!left || !right) return false;
  return left === right;
}
