import { parseBrandStoreCompositeHost } from "@/lib/storefront/brand-host-resolve";
import { resolveMarketFromHostLabel } from "@/lib/storefront/market-host-resolve";
import { extractSubdomainStoreSlug } from "@/lib/storefront/middleware-paths";

export type VanityHostGuess = {
  storeSlug: string | null;
  marketId: string | null;
  /** True when host looks like brand.store.root — caller should use resolve-host API. */
  needsDbResolution: boolean;
};

/**
 * Fast middleware-side vanity label resolution (no DB).
 * Brand composite (`brand.store.root`) and dotted labels always defer to resolve-host API.
 */
export async function guessVanityHostFromLabel(
  hostRaw: string,
  rootDomain: string,
): Promise<VanityHostGuess> {
  const root = rootDomain.trim().toLowerCase();
  const hostNoPort = hostRaw.split(":")[0]?.toLowerCase() ?? "";
  if (!hostNoPort.endsWith(`.${root}`)) {
    return { storeSlug: null, marketId: null, needsDbResolution: true };
  }

  const sub = hostNoPort.slice(0, -(root.length + 1));
  if (!sub || sub === "www") {
    return { storeSlug: null, marketId: null, needsDbResolution: true };
  }

  if (sub.includes(".")) {
    const composite = parseBrandStoreCompositeHost(hostNoPort, root);
    if (composite) {
      return { storeSlug: composite.storeSlug, marketId: null, needsDbResolution: true };
    }
    return { storeSlug: null, marketId: null, needsDbResolution: true };
  }

  // Slug-only vanity (`hello.root`) — no DB; composite market labels use `{slug}-{marketId}`.
  if (!sub.includes("-")) {
    const slugOnly = extractSubdomainStoreSlug(hostRaw, root);
    if (slugOnly) {
      return { storeSlug: slugOnly, marketId: null, needsDbResolution: false };
    }
  }

  const marketHost = await resolveMarketFromHostLabel(sub);
  if (marketHost) {
    return { storeSlug: marketHost.storeSlug, marketId: marketHost.marketId, needsDbResolution: false };
  }

  const slug = extractSubdomainStoreSlug(hostRaw, root);
  if (slug) {
    return { storeSlug: slug, marketId: null, needsDbResolution: false };
  }

  return { storeSlug: null, marketId: null, needsDbResolution: true };
}
