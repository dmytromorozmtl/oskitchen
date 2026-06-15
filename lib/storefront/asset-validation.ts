import {
  STOREFRONT_MEDIA_ALLOWED_MIME,
  STOREFRONT_MEDIA_MAX_BYTES,
} from "@/lib/upload-policy/media-upload-validation";

export {
  STOREFRONT_MEDIA_ALLOWED_MIME,
  STOREFRONT_MEDIA_MAX_BYTES,
  validateStorefrontMediaUpload,
} from "@/lib/upload-policy/media-upload-validation";

const STOREFRONT_ALLOWED = new Set<string>(STOREFRONT_MEDIA_ALLOWED_MIME);

export function isAllowedStorefrontImageMime(mime: string): boolean {
  return STOREFRONT_ALLOWED.has(mime.toLowerCase());
}

export function assertImageWithinSizeBytes(
  size: number,
  maxBytes = STOREFRONT_MEDIA_MAX_BYTES,
): boolean {
  return size > 0 && size <= maxBytes;
}
