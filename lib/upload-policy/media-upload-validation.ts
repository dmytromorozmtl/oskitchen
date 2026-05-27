export const STOREFRONT_MEDIA_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const STOREFRONT_MEDIA_MAX_BYTES = 8 * 1024 * 1024;

export const KITCHEN_RASTER_IMAGE_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const KITCHEN_RASTER_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

const STOREFRONT_ALLOWED = new Set<string>(STOREFRONT_MEDIA_ALLOWED_MIME);
const KITCHEN_RASTER_ALLOWED = new Set<string>(KITCHEN_RASTER_IMAGE_ALLOWED_MIME);

const DANGEROUS_SVG_PATTERNS = [
  /<script\b/i,
  /\bon[a-z]+\s*=/i,
  /javascript:/i,
  /<foreignObject\b/i,
] as const;

function rejectUnsafeSvgContent(bytes: Uint8Array): string | null {
  const svgText = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (DANGEROUS_SVG_PATTERNS.some((pattern) => pattern.test(svgText))) {
    return "SVG files with scripts, event handlers, or embedded active content are not allowed.";
  }
  return null;
}

export function validateStorefrontMediaUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}):
  | { ok: true; mimeType: (typeof STOREFRONT_MEDIA_ALLOWED_MIME)[number] }
  | { ok: false; error: string } {
  const mimeType = input.mimeType.toLowerCase();
  if (!STOREFRONT_ALLOWED.has(mimeType)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed." };
  }

  if (input.bytes.byteLength <= 0 || input.bytes.byteLength > STOREFRONT_MEDIA_MAX_BYTES) {
    return { ok: false, error: "File too large (max 8MB)." };
  }

  if (mimeType === "image/svg+xml") {
    const svgError = rejectUnsafeSvgContent(input.bytes);
    if (svgError) {
      return { ok: false, error: svgError };
    }
  }

  return {
    ok: true,
    mimeType: mimeType as (typeof STOREFRONT_MEDIA_ALLOWED_MIME)[number],
  };
}

export function validateKitchenRasterImageUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}):
  | { ok: true; mimeType: (typeof KITCHEN_RASTER_IMAGE_ALLOWED_MIME)[number] }
  | { ok: false; error: string } {
  const mimeType = input.mimeType.toLowerCase();
  if (!KITCHEN_RASTER_ALLOWED.has(mimeType)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }

  if (input.bytes.byteLength <= 0 || input.bytes.byteLength > KITCHEN_RASTER_IMAGE_MAX_BYTES) {
    return { ok: false, error: "File too large (max 4MB)." };
  }

  return {
    ok: true,
    mimeType: mimeType as (typeof KITCHEN_RASTER_IMAGE_ALLOWED_MIME)[number],
  };
}

export function kitchenRasterImageExtension(
  mimeType: (typeof KITCHEN_RASTER_IMAGE_ALLOWED_MIME)[number],
): "jpg" | "png" | "webp" | "gif" {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/jpeg":
      return "jpg";
  }
}
