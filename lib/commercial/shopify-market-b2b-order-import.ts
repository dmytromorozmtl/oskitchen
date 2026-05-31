export const SHOPIFY_MARKET_B2B_ORDER_IMPORT_HONESTY =
  "B2B order enrichment attaches company, location, and market routing hints to channel staging — kitchen orders inherit metadata on approve, not at webhook time.";

export function isShopifyMarketsB2bOrderImportEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_ORDER_IMPORT === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export type B2bOrderEnrichmentStatus = "complete" | "partial" | "unresolved" | "not_b2b";

export function b2bEnrichmentStatusLabel(status: B2bOrderEnrichmentStatus): string {
  switch (status) {
    case "complete":
      return "Complete routing";
    case "partial":
      return "Partial routing";
    case "unresolved":
      return "Unresolved routing";
    default:
      return "Not B2B";
  }
}
