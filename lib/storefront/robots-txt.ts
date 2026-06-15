import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

export const ROBOTS_TXT_CACHE_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400, max-age=600",
} as const;

export function buildStorefrontRobotsTxt(input: {
  canonicalBase: string;
  sf: StorefrontPublicPayload;
  brandSlug?: string | null;
}): string {
  const base = input.canonicalBase.replace(/\/$/, "");
  const noindex = input.sf.robotsPolicy === "noindex";
  const lines: string[] = [];

  if (noindex) {
    lines.push("User-agent: *", "Disallow: /");
  } else {
    lines.push("User-agent: *", "Allow: /", `Sitemap: ${base}/sitemap.xml`);
  }

  if (input.brandSlug) {
    lines.push("", `# brand: ${input.brandSlug}`);
  }

  return `${lines.join("\n")}\n`;
}
