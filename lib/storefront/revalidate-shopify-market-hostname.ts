import { createHash } from "crypto";

export function computeShopifyMarketHostnameHash(input: {
  shopifyHandle: string | null;
  suggestedHostSubdomain: string;
  suggestedStoreSlug: string;
}): string {
  const payload = JSON.stringify({
    handle: input.shopifyHandle?.trim().toLowerCase() ?? "",
    host: input.suggestedHostSubdomain.trim().toLowerCase(),
    slug: input.suggestedStoreSlug.trim().toLowerCase(),
  });
  return createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 16);
}
