/** CDN purge tags (Vercel / Cloudflare). */

import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

export function storefrontSitemapCacheTag(storefrontId: string): string {
  return `storefront-${storefrontId}-sitemap`;
}

export function storefrontSlugCacheTag(storeSlug: string): string {
  return `storefront-${storeSlug}`;
}

/** Per-arm HTML cache tag when theme A/B is active at the edge. */
export function storefrontThemeArmCacheTag(storeSlug: string, arm: ThemeExperimentArm): string {
  return `sf-${storeSlug}-theme-${arm}`;
}

export function themeSnapshotCacheTag(storefrontId: string, themePublishedAt: Date | string | number | null): string {
  const ts =
    themePublishedAt instanceof Date
      ? themePublishedAt.getTime()
      : typeof themePublishedAt === "number"
        ? themePublishedAt
        : themePublishedAt
          ? new Date(themePublishedAt).getTime()
          : 0;
  return `theme-${storefrontId}-${ts || "draft"}`;
}

export function mergeCdnCacheTag(headers: Record<string, string>, tag: string): Record<string, string> {
  const existing = headers["CDN-Cache-Tag"];
  return {
    ...headers,
    "CDN-Cache-Tag": existing ? `${existing}, ${tag}` : tag,
  };
}
