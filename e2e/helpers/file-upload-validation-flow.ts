import { expect, type APIRequestContext } from "@playwright/test";

import {
  FILE_UPLOAD_DENIAL_CASES,
  FILE_UPLOAD_PUBLIC_ROUTE,
  FILE_UPLOAD_VALIDATION_DENIED_STATUS,
  type FileUploadAllowCase,
  type FileUploadDenialCase,
  type FileUploadValidationChannel,
} from "@/lib/upload-policy/file-upload-validation-e2e-policy";
import {
  validateImportCsvUpload,
  validateKitchenRasterImageUpload,
  validateProfileAvatarUpload,
  validateStorefrontFormAttachmentUpload,
  validateStorefrontMediaUpload,
} from "@/lib/upload-policy/media-upload-validation";
import { runUploadMalwareScan } from "@/lib/upload-policy/malware-scan";

import {
  buildUploadFixtureBytes,
  type FileUploadFixtureKind,
  type StorefrontFormUploadFixture,
} from "./file-upload-validation-ready";

type ValidationResult = { ok: true } | { ok: false; error: string };

function runChannelValidation(
  channel: FileUploadValidationChannel,
  bytes: Uint8Array,
  mimeType: string,
  filename?: string,
): ValidationResult {
  switch (channel) {
    case "kitchen_raster":
      return validateKitchenRasterImageUpload({ bytes, mimeType });
    case "storefront_form":
      return validateStorefrontFormAttachmentUpload({ bytes, mimeType });
    case "profile_avatar":
      return validateProfileAvatarUpload({ bytes, mimeType });
    case "import_csv":
      return validateImportCsvUpload({ bytes, filename: filename ?? "import.csv" });
    case "storefront_media":
      return validateStorefrontMediaUpload({ bytes, mimeType });
  }
}

export async function assertUploadValidationDenies(
  denialCase: FileUploadDenialCase,
): Promise<void> {
  const bytes = buildUploadFixtureBytes(denialCase.fixture, denialCase.channel);
  const result = runChannelValidation(
    denialCase.channel,
    bytes,
    denialCase.mimeType,
    denialCase.filename,
  );

  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error(`expected upload denial for ${denialCase.id}`);
  }
  expect(result.error).toBe(denialCase.expectedError);
}

export async function assertUploadValidationAllows(allowCase: FileUploadAllowCase): Promise<void> {
  const bytes = buildUploadFixtureBytes(allowCase.fixture, allowCase.channel);
  const result = runChannelValidation(allowCase.channel, bytes, allowCase.mimeType);

  expect(result.ok).toBe(true);
}

export async function assertMalwareScanBlocksEicar(): Promise<void> {
  const bytes = new TextEncoder().encode(
    "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
  );
  const scanned = await runUploadMalwareScan({ bytes, mimeType: "text/plain" });
  expect(scanned.ok).toBe(false);
  if (scanned.ok) {
    throw new Error("expected EICAR malware scan block");
  }
  expect(scanned.threat).toBe("eicar_test_signature");
}

export async function assertHttpRejectsForeignMimeUpload(
  request: APIRequestContext,
  fixture: StorefrontFormUploadFixture,
): Promise<void> {
  const response = await request.post(FILE_UPLOAD_PUBLIC_ROUTE, {
    multipart: {
      storeSlug: fixture.storeSlug,
      formId: fixture.formId,
      fieldId: fixture.fieldId,
      file: {
        name: "payload.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.from(buildUploadFixtureBytes("foreign_mime")),
      },
    },
  });

  expect(response.status()).toBe(FILE_UPLOAD_VALIDATION_DENIED_STATUS);
  const body = (await response.json()) as { error?: string };
  expect(body.error).toBe("File type not allowed (JPEG, PNG, WebP, PDF only).");
}

export function listDenialCasesForChannel(
  channel: FileUploadValidationChannel,
): readonly FileUploadDenialCase[] {
  return FILE_UPLOAD_DENIAL_CASES.filter((entry) => entry.channel === channel);
}
