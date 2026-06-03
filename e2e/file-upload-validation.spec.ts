import { expect, test } from "@playwright/test";

import {
  FILE_UPLOAD_ALLOW_CASES,
  FILE_UPLOAD_CHANNEL_LIMITS,
  FILE_UPLOAD_DENIAL_CASES,
  FILE_UPLOAD_PUBLIC_ROUTE,
  FILE_UPLOAD_VALIDATION_E2E_POLICY_ID,
  channelMaxBytes,
  isFileUploadValidationDeniedStatus,
} from "@/lib/upload-policy/file-upload-validation-e2e-policy";

import {
  assertHttpRejectsForeignMimeUpload,
  assertMalwareScanBlocksEicar,
  assertUploadValidationAllows,
  assertUploadValidationDenies,
  listDenialCasesForChannel,
} from "./helpers/file-upload-validation-flow";
import {
  seedStorefrontFormUploadFixture,
  skipFileUploadValidationHttpIfNoBaseUrl,
  skipFileUploadValidationIfNoDb,
} from "./helpers/file-upload-validation-ready";

/**
 * File upload validation E2E — MIME, size, extension, PDF header, SVG script, malware scan.
 *
 * @see lib/upload-policy/media-upload-validation.ts
 * @see app/api/storefront/forms/upload/route.ts
 */

test.describe("file upload validation policy", () => {
  test("exports denial matrix and channel byte limits", () => {
    expect(FILE_UPLOAD_VALIDATION_E2E_POLICY_ID).toBe("file-upload-validation-e2e-v1");
    expect(FILE_UPLOAD_DENIAL_CASES.length).toBeGreaterThanOrEqual(9);
    expect(FILE_UPLOAD_PUBLIC_ROUTE).toBe("/api/storefront/forms/upload");
    expect(channelMaxBytes("kitchen_raster")).toBe(FILE_UPLOAD_CHANNEL_LIMITS.kitchen_raster);
    expect(isFileUploadValidationDeniedStatus(400)).toBe(true);
    expect(isFileUploadValidationDeniedStatus(200)).toBe(false);
  });

  test("denial matrix covers kitchen, storefront form, profile, csv, and media", () => {
    expect(listDenialCasesForChannel("kitchen_raster").length).toBeGreaterThanOrEqual(3);
    expect(listDenialCasesForChannel("storefront_form").length).toBeGreaterThanOrEqual(3);
    expect(listDenialCasesForChannel("profile_avatar").length).toBeGreaterThanOrEqual(1);
    expect(listDenialCasesForChannel("import_csv").length).toBeGreaterThanOrEqual(1);
    expect(listDenialCasesForChannel("storefront_media").length).toBeGreaterThanOrEqual(1);
  });
});

test.describe("file upload validation validators", () => {
  test("denies unsupported mime, empty, oversized, and unsafe content per policy", async () => {
    for (const denialCase of FILE_UPLOAD_DENIAL_CASES) {
      await assertUploadValidationDenies(denialCase);
    }
  });

  test("allows canonical png and pdf fixtures", async () => {
    for (const allowCase of FILE_UPLOAD_ALLOW_CASES) {
      await assertUploadValidationAllows(allowCase);
    }
  });

  test("malware scan blocks EICAR test signature", async () => {
    await assertMalwareScanBlocksEicar();
  });
});

test.describe("file upload validation HTTP", () => {
  test.beforeEach(() => {
    skipFileUploadValidationIfNoDb();
    skipFileUploadValidationHttpIfNoBaseUrl();
  });

  test("storefront form upload rejects video/mp4 before storage", async ({ request }) => {
    const fixture = await seedStorefrontFormUploadFixture("http-mp4");
    try {
      await assertHttpRejectsForeignMimeUpload(request, fixture);
    } finally {
      await fixture.cleanup();
    }
  });
});
