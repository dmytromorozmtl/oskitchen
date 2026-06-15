import {
  STOREFRONT_FORM_FILE_MAX_BYTES,
  STOREFRONT_FORM_FILE_MIME,
} from "@/lib/storefront/forms";

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

export const PROFILE_AVATAR_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const INVOICE_OCR_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export const IMPORT_CSV_MAX_BYTES = 5 * 1024 * 1024;

const PROFILE_AVATAR_ALLOWED = new Set<string>(PROFILE_AVATAR_ALLOWED_MIME);

const STOREFRONT_ALLOWED = new Set<string>(STOREFRONT_MEDIA_ALLOWED_MIME);
const KITCHEN_RASTER_ALLOWED = new Set<string>(KITCHEN_RASTER_IMAGE_ALLOWED_MIME);
const STOREFRONT_FORM_ALLOWED = new Set<string>(STOREFRONT_FORM_FILE_MIME);

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

export function validateStorefrontFormAttachmentUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}):
  | { ok: true; mimeType: (typeof STOREFRONT_FORM_FILE_MIME)[number] }
  | { ok: false; error: string } {
  const mimeType = input.mimeType.toLowerCase();
  if (!STOREFRONT_FORM_ALLOWED.has(mimeType)) {
    return { ok: false, error: "File type not allowed (JPEG, PNG, WebP, PDF only)." };
  }

  if (input.bytes.byteLength <= 0) {
    return { ok: false, error: "File is empty." };
  }

  if (input.bytes.byteLength > STOREFRONT_FORM_FILE_MAX_BYTES) {
    return { ok: false, error: "File too large (max 5MB)." };
  }

  if (mimeType === "application/pdf") {
    const header = new TextDecoder("utf-8", { fatal: false }).decode(input.bytes.slice(0, 5));
    if (!header.startsWith("%PDF-")) {
      return { ok: false, error: "Invalid PDF file." };
    }
  }

  return {
    ok: true,
    mimeType: mimeType as (typeof STOREFRONT_FORM_FILE_MIME)[number],
  };
}

export function storefrontFormAttachmentExtension(
  mimeType: (typeof STOREFRONT_FORM_FILE_MIME)[number],
): "jpg" | "png" | "webp" | "pdf" {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
  }
}

export function validateProfileAvatarUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}):
  | { ok: true; mimeType: (typeof PROFILE_AVATAR_ALLOWED_MIME)[number] }
  | { ok: false; error: string } {
  const mimeType = input.mimeType.toLowerCase();
  if (!PROFILE_AVATAR_ALLOWED.has(mimeType)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }
  if (input.bytes.byteLength <= 0 || input.bytes.byteLength > PROFILE_AVATAR_MAX_BYTES) {
    return { ok: false, error: "Image must be 2MB or smaller." };
  }
  return {
    ok: true,
    mimeType: mimeType as (typeof PROFILE_AVATAR_ALLOWED_MIME)[number],
  };
}

export function profileAvatarExtension(
  mimeType: (typeof PROFILE_AVATAR_ALLOWED_MIME)[number],
): "jpg" | "png" | "webp" {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
  }
}

/** Invoice OCR accepts raster photos of supplier invoices (Vision API). */
export function validateInvoiceOcrImageUpload(input: {
  bytes: Uint8Array;
  mimeType: string;
}): ReturnType<typeof validateKitchenRasterImageUpload> {
  const base = validateKitchenRasterImageUpload(input);
  if (!base.ok) {
    return base;
  }
  if (input.bytes.byteLength > INVOICE_OCR_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Invoice image too large (max 8MB)." };
  }
  return base;
}

export function validateImportCsvUpload(input: {
  bytes: Uint8Array;
  filename: string;
}): { ok: true } | { ok: false; error: string } {
  const name = input.filename.trim().toLowerCase();
  if (!name.endsWith(".csv")) {
    return { ok: false, error: "Only .csv files are allowed." };
  }
  if (input.bytes.byteLength <= 0) {
    return { ok: false, error: "File is empty." };
  }
  if (input.bytes.byteLength > IMPORT_CSV_MAX_BYTES) {
    return { ok: false, error: "CSV file too large (max 5MB)." };
  }
  return { ok: true };
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
