export const STOREFRONT_MEDIA_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const STOREFRONT_MEDIA_MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED = new Set<string>(STOREFRONT_MEDIA_ALLOWED_MIME);
const DANGEROUS_SVG_PATTERNS = [
  /<script\b/i,
  /\bon[a-z]+\s*=/i,
  /javascript:/i,
  /<foreignObject\b/i,
] as const;

export function isAllowedStorefrontImageMime(mime: string): boolean {
  return ALLOWED.has(mime.toLowerCase());
}

export function assertImageWithinSizeBytes(size: number, maxBytes = STOREFRONT_MEDIA_MAX_BYTES): boolean {
  return size > 0 && size <= maxBytes;
}

export function validateStorefrontMediaUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}):
  | { ok: true; mimeType: (typeof STOREFRONT_MEDIA_ALLOWED_MIME)[number] }
  | { ok: false; error: string } {
  const mimeType = input.mimeType.toLowerCase();
  if (!isAllowedStorefrontImageMime(mimeType)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed." };
  }

  if (!assertImageWithinSizeBytes(input.bytes.byteLength)) {
    return { ok: false, error: "File too large (max 8MB)." };
  }

  if (mimeType === "image/svg+xml") {
    const svgText = new TextDecoder("utf-8", { fatal: false }).decode(input.bytes);
    if (DANGEROUS_SVG_PATTERNS.some((pattern) => pattern.test(svgText))) {
      return {
        ok: false,
        error: "SVG files with scripts, event handlers, or embedded active content are not allowed.",
      };
    }
  }

  return {
    ok: true,
    mimeType: mimeType as (typeof STOREFRONT_MEDIA_ALLOWED_MIME)[number],
  };
}
