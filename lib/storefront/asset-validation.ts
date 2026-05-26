import { STOREFRONT_PERF } from "@/lib/storefront/performance-limits";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAllowedStorefrontImageMime(mime: string): boolean {
  return ALLOWED.has(mime.toLowerCase());
}

export function assertImageWithinSizeBytes(size: number, maxBytes = STOREFRONT_PERF.defaultMaxImageBytes): boolean {
  return size > 0 && size <= maxBytes;
}
