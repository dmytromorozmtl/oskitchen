import { prisma } from "@/lib/prisma";
import { compositeMarketHostLabel } from "@/lib/storefront/market-host-label";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";

export type MarketHostResolution = {
  storeSlug: string;
  marketId: string;
};

export { compositeMarketHostLabel } from "@/lib/storefront/market-host-label";

/**
 * Resolve a subdomain label to storefront slug + market id.
 * Supports: market.hostSubdomain, composite {slug}-{marketId}, or legacy slug-only.
 */
export async function resolveMarketFromHostLabel(
  hostLabel: string,
): Promise<MarketHostResolution | null> {
  const sub = hostLabel.trim().toLowerCase();
  if (!sub || !/^[a-z0-9-]{2,120}$/.test(sub)) return null;

  const published = await prisma.storefrontSettings.findMany({
    where: { enabled: true, published: true },
    select: { storeSlug: true, userId: true },
  });

  for (const sf of published) {
    const markets = await loadMarketsForStorefrontOwner(sf.userId);
    for (const m of markets) {
      if (m.enabled === false) continue;
      const custom = m.hostSubdomain?.trim().toLowerCase();
      if (custom && custom === sub) {
        return { storeSlug: sf.storeSlug, marketId: m.id };
      }
    }
  }

  for (const sf of published) {
    const prefix = `${sf.storeSlug.toLowerCase()}-`;
    if (!sub.startsWith(prefix)) continue;
    const marketId = sub.slice(prefix.length);
    if (!marketId) continue;
    const markets = await loadMarketsForStorefrontOwner(sf.userId);
    if (markets.some((m) => m.id === marketId && m.enabled !== false)) {
      return { storeSlug: sf.storeSlug, marketId };
    }
  }

  return null;
}
