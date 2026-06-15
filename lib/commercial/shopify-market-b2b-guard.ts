export const SHOPIFY_MARKET_B2B_GUARD_HONESTY =
  "Shopify B2B company hints never create KitchenOS company accounts automatically — link or reconcile manually unless b2bAuthority is shopify.";

export const SHOPIFY_MARKETS_B2B_REQUIRED_SCOPES = ["read_companies"] as const;

export function isShopifyMarketsB2bGuardEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_GUARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/** Normalize company names for fuzzy equality checks. */
export function normalizeB2bCompanyName(name: string | null | undefined): string {
  return (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function b2bCompanyNamesMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = normalizeB2bCompanyName(a);
  const right = normalizeB2bCompanyName(b);
  if (!left || !right) return false;
  return left === right;
}

export function b2bEmailsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = a?.trim().toLowerCase() ?? "";
  const right = b?.trim().toLowerCase() ?? "";
  if (!left || !right) return false;
  return left === right;
}
