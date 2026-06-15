import { prisma } from "@/lib/prisma";
import { resolveBrandHost } from "@/lib/storefront/brand-host-resolve";
import { resolveMarketFromHostLabel } from "@/lib/storefront/market-host-resolve";

export type HostResolution =
  | { kind: "none" }
  | { kind: "path"; storeSlug: string }
  | { kind: "subdomain"; storeSlug: string; marketId?: string; brandId?: string }
  | { kind: "custom_domain"; storeSlug: string; storefrontId: string; marketId?: string; brandId?: string };

function normalizeHost(host: string | null): string | null {
  if (!host) return null;
  const h = host.split(":")[0]?.trim().toLowerCase();
  return h || null;
}

/**
 * Map a public hostname to a path-based store slug (used by middleware + internal APIs).
 * Does not apply path-based slug parsing — callers pass slug from `/s/[slug]` separately.
 */
export async function resolveStorefrontSlugFromHost(hostInput: string | null): Promise<HostResolution> {
  const host = normalizeHost(hostInput);
  if (!host) return { kind: "none" };

  const root = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.trim().toLowerCase();

  const brandHost = await resolveBrandHost(host, root);
  if (brandHost) {
    const sf = await prisma.storefrontSettings.findFirst({
      where: { storeSlug: brandHost.storeSlug, enabled: true, published: true },
      select: { id: true },
    });
    if (sf) {
      return {
        kind: "custom_domain",
        storeSlug: brandHost.storeSlug,
        storefrontId: sf.id,
        brandId: brandHost.brandId,
      };
    }
  }

  if (root && host !== root && host !== `www.${root}` && host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (/^[a-z0-9-]{2,120}$/i.test(sub)) {
      const bySubdomainCol = await prisma.storefrontSettings.findFirst({
        where: {
          enabled: true,
          published: true,
          subdomain: { equals: sub, mode: "insensitive" },
        },
        select: { storeSlug: true },
      });
      if (bySubdomainCol) {
        return { kind: "subdomain", storeSlug: bySubdomainCol.storeSlug };
      }
      const marketHost = await resolveMarketFromHostLabel(sub);
      if (marketHost) {
        return {
          kind: "subdomain",
          storeSlug: marketHost.storeSlug,
          marketId: marketHost.marketId,
        };
      }
      return { kind: "subdomain", storeSlug: sub.toLowerCase() };
    }
  }

  const row = await prisma.storefrontSettings.findFirst({
    where: {
      enabled: true,
      published: true,
      OR: [
        { customDomain: { equals: host, mode: "insensitive" } },
        { domains: { some: { domain: { equals: host, mode: "insensitive" }, status: "VERIFIED" } } },
      ],
    },
    select: { id: true, storeSlug: true },
  });
  if (row) {
    return { kind: "custom_domain", storeSlug: row.storeSlug, storefrontId: row.id };
  }

  return { kind: "none" };
}
