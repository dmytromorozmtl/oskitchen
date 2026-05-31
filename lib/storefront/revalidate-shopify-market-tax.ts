import { createHash } from "crypto";

export function computeShopifyMarketTaxHash(input: {
  regionCodes: string[];
  taxIncludedInPrices: boolean | null;
  totalRatePercent: number;
  dutiesEnabled: boolean | null;
}): string {
  const payload = JSON.stringify({
    regions: [...input.regionCodes].sort(),
    included: input.taxIncludedInPrices,
    rate: input.totalRatePercent.toFixed(2),
    duties: input.dutiesEnabled,
  });
  return createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 16);
}
