import { mergeCdnCacheTag, storefrontSitemapCacheTag } from "@/lib/storefront/cdn-cache";
import { localeAlternateUrl } from "@/lib/storefront/locale-path";
import { storefrontAlternateLocales } from "@/lib/storefront/regional";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildSitemapUrlsetXml(input: {
  base: string;
  pathSuffixes: string[];
  primaryLocale: string;
}): string {
  const localeCodes = storefrontAlternateLocales(input.primaryLocale);
  const urlEntries = input.pathSuffixes
    .map((pathSuffix) => {
      const loc = escapeXml(localeAlternateUrl(input.base, pathSuffix, input.primaryLocale, input.primaryLocale));
      const hreflangLinks = localeCodes
        .map(
          (code) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(code)}" href="${escapeXml(localeAlternateUrl(input.base, pathSuffix, code, input.primaryLocale))}" />`,
        )
        .join("\n");
      return `  <url>
    <loc>${loc}</loc>
${hreflangLinks}
    <changefreq>weekly</changefreq>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

/** Public chunk URL: vanity/custom hosts use `/sitemaps/n.xml`; path-hosted uses `/s/{slug}/sitemaps/n.xml`. */
export function storefrontSitemapChunkUrl(canonicalBase: string, storeSlug: string, page: number): string {
  const base = canonicalBase.replace(/\/$/, "");
  if (base.endsWith(`/s/${storeSlug}`)) {
    return `${base}/sitemaps/${page}.xml`;
  }
  return `${base}/sitemaps/${page}.xml`;
}

export function buildSitemapIndexXml(input: {
  base: string;
  storeSlug: string;
  chunkCount: number;
}): string {
  const entries = Array.from({ length: input.chunkCount }, (_, i) => {
    const loc = escapeXml(storefrontSitemapChunkUrl(input.base, input.storeSlug, i + 1));
    return `  <sitemap>
    <loc>${loc}</loc>
  </sitemap>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

const SITEMAP_CACHE_BASE = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400, max-age=600",
} as const;

export const SITEMAP_CACHE_HEADERS = SITEMAP_CACHE_BASE;

export function sitemapResponseHeaders(storefrontId: string): Record<string, string> {
  return mergeCdnCacheTag({ ...SITEMAP_CACHE_BASE }, storefrontSitemapCacheTag(storefrontId));
}
