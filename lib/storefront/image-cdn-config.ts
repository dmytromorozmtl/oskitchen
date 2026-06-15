import type { RemotePattern } from "next/dist/shared/lib/image-config";

const DEFAULT_IMAGE_HOSTS = [
  "*.supabase.co",
  "images.unsplash.com",
  "*.vercel-storage.com",
  "cdn.shopify.com",
  "res.cloudinary.com",
  "imagedelivery.net",
];

/**
 * Remote image hosts for next/image — extend via STOREFRONT_IMAGE_HOSTS (comma-separated).
 */
export function storefrontImageRemotePatterns(): RemotePattern[] {
  const fromEnv = process.env.STOREFRONT_IMAGE_HOSTS?.split(/[,\s]+/).filter(Boolean) ?? [];
  const hostnames = [...new Set([...DEFAULT_IMAGE_HOSTS, ...fromEnv])];

  return hostnames.flatMap((hostname) => {
    const wild = hostname.startsWith("*.");
    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: wild ? "/**" : "/**",
      },
    ];
  });
}

/** Audit helper for Lighthouse / ops — lists configured patterns. */
export function listStorefrontImageHostsForAudit(): string[] {
  return storefrontImageRemotePatterns().map((p) => p.hostname);
}
