/**
 * File upload validation E2E policy (QA-29).
 *
 * MIME/size/extension gates across kitchen, storefront, profile, CSV, and malware scan.
 *
 * @see e2e/file-upload-validation.spec.ts
 * @see lib/upload-policy/media-upload-validation.ts
 */

import {
  IMPORT_CSV_MAX_BYTES,
  KITCHEN_RASTER_IMAGE_MAX_BYTES,
  PROFILE_AVATAR_MAX_BYTES,
  STOREFRONT_MEDIA_MAX_BYTES,
} from "@/lib/upload-policy/media-upload-validation";
import { STOREFRONT_FORM_FILE_MAX_BYTES } from "@/lib/storefront/forms";

export const FILE_UPLOAD_VALIDATION_E2E_POLICY_ID = "file-upload-validation-e2e-v1" as const;

export const FILE_UPLOAD_VALIDATION_DENIED_STATUS = 400 as const;

export const FILE_UPLOAD_PUBLIC_ROUTE = "/api/storefront/forms/upload" as const;

export type FileUploadValidationChannel =
  | "kitchen_raster"
  | "storefront_form"
  | "profile_avatar"
  | "import_csv"
  | "storefront_media";

export type FileUploadDenialCase = {
  id: string;
  channel: FileUploadValidationChannel;
  mimeType: string;
  filename?: string;
  fixture: "empty" | "oversized" | "foreign_mime" | "fake_pdf" | "unsafe_svg";
  expectedError: string;
};

export const FILE_UPLOAD_CHANNEL_LIMITS = {
  kitchen_raster: KITCHEN_RASTER_IMAGE_MAX_BYTES,
  storefront_form: STOREFRONT_FORM_FILE_MAX_BYTES,
  profile_avatar: PROFILE_AVATAR_MAX_BYTES,
  import_csv: IMPORT_CSV_MAX_BYTES,
  storefront_media: STOREFRONT_MEDIA_MAX_BYTES,
} as const;

export const FILE_UPLOAD_DENIAL_CASES: readonly FileUploadDenialCase[] = [
  {
    id: "kitchen-rejects-mp4",
    channel: "kitchen_raster",
    mimeType: "video/mp4",
    fixture: "foreign_mime",
    expectedError: "Only JPEG, PNG, WebP, or GIF images are allowed.",
  },
  {
    id: "kitchen-rejects-svg",
    channel: "kitchen_raster",
    mimeType: "image/svg+xml",
    fixture: "unsafe_svg",
    expectedError: "Only JPEG, PNG, WebP, or GIF images are allowed.",
  },
  {
    id: "kitchen-rejects-oversized",
    channel: "kitchen_raster",
    mimeType: "image/png",
    fixture: "oversized",
    expectedError: "File too large (max 4MB).",
  },
  {
    id: "storefront-form-rejects-mp4",
    channel: "storefront_form",
    mimeType: "video/mp4",
    fixture: "foreign_mime",
    expectedError: "File type not allowed (JPEG, PNG, WebP, PDF only).",
  },
  {
    id: "storefront-form-rejects-empty",
    channel: "storefront_form",
    mimeType: "image/jpeg",
    fixture: "empty",
    expectedError: "File is empty.",
  },
  {
    id: "storefront-form-rejects-fake-pdf",
    channel: "storefront_form",
    mimeType: "application/pdf",
    fixture: "fake_pdf",
    expectedError: "Invalid PDF file.",
  },
  {
    id: "profile-avatar-rejects-gif",
    channel: "profile_avatar",
    mimeType: "image/gif",
    fixture: "foreign_mime",
    expectedError: "Only JPEG, PNG, or WebP images are allowed.",
  },
  {
    id: "import-csv-rejects-non-csv",
    channel: "import_csv",
    mimeType: "text/plain",
    filename: "orders.exe",
    fixture: "foreign_mime",
    expectedError: "Only .csv files are allowed.",
  },
  {
    id: "storefront-media-rejects-unsafe-svg",
    channel: "storefront_media",
    mimeType: "image/svg+xml",
    fixture: "unsafe_svg",
    expectedError: "SVG files with scripts, event handlers, or embedded active content are not allowed.",
  },
] as const;

export const FILE_UPLOAD_ALLOW_CASES = [
  {
    id: "kitchen-accepts-png",
    channel: "kitchen_raster" as const,
    mimeType: "image/png",
    fixture: "valid_png" as const,
  },
  {
    id: "storefront-form-accepts-pdf",
    channel: "storefront_form" as const,
    mimeType: "application/pdf",
    fixture: "valid_pdf" as const,
  },
] as const;

export type FileUploadAllowCase = (typeof FILE_UPLOAD_ALLOW_CASES)[number];

export function isFileUploadValidationDeniedStatus(status: number): boolean {
  return status === FILE_UPLOAD_VALIDATION_DENIED_STATUS;
}

export function channelMaxBytes(channel: FileUploadValidationChannel): number {
  return FILE_UPLOAD_CHANNEL_LIMITS[channel];
}
