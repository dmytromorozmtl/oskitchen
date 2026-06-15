import { STOREFRONT_PERF } from "@/lib/storefront/performance-limits";

export type ImageLoadingHint = "eager" | "lazy";

/** First hero-like section may request eager loading; others default lazy below the fold. */
export function publicSectionImageLoading(isFirstVisibleSection: boolean, sectionType: string): ImageLoadingHint {
  if (isFirstVisibleSection && (sectionType === "HERO" || sectionType === "IMAGE_TEXT" || sectionType === "SLIDER")) {
    return "eager";
  }
  return "lazy";
}

export function maxImageBytesFromEnv(): number {
  const raw = process.env.STOREFRONT_MAX_IMAGE_BYTES;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n > 0) return Math.min(n, 20 * 1024 * 1024);
  return STOREFRONT_PERF.defaultMaxImageBytes;
}
