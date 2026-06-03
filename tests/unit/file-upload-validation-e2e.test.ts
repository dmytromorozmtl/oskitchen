import { describe, expect, it } from "vitest";

import {
  FILE_UPLOAD_ALLOW_CASES,
  FILE_UPLOAD_CHANNEL_LIMITS,
  FILE_UPLOAD_DENIAL_CASES,
  FILE_UPLOAD_PUBLIC_ROUTE,
  FILE_UPLOAD_VALIDATION_E2E_POLICY_ID,
  channelMaxBytes,
  isFileUploadValidationDeniedStatus,
} from "@/lib/upload-policy/file-upload-validation-e2e-policy";
import { validateKitchenRasterImageUpload } from "@/lib/upload-policy/media-upload-validation";
import { runUploadMalwareScan } from "@/lib/upload-policy/malware-scan";

describe("file upload validation E2E policy (QA-29)", () => {
  it("exports policy id, route, and channel limits", () => {
    expect(FILE_UPLOAD_VALIDATION_E2E_POLICY_ID).toBe("file-upload-validation-e2e-v1");
    expect(FILE_UPLOAD_PUBLIC_ROUTE).toBe("/api/storefront/forms/upload");
    expect(FILE_UPLOAD_DENIAL_CASES.length).toBe(9);
    expect(FILE_UPLOAD_ALLOW_CASES.length).toBe(2);
    expect(channelMaxBytes("storefront_form")).toBe(FILE_UPLOAD_CHANNEL_LIMITS.storefront_form);
    expect(isFileUploadValidationDeniedStatus(400)).toBe(true);
  });

  it("kitchen raster validator rejects mp4 via policy fixture", () => {
    const denial = FILE_UPLOAD_DENIAL_CASES.find((entry) => entry.id === "kitchen-rejects-mp4")!;
    const bytes = new Uint8Array([0, 0, 0, 1]);
    const result = validateKitchenRasterImageUpload({ bytes, mimeType: denial.mimeType });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(denial.expectedError);
    }
  });

  it("malware scan blocks EICAR signature", async () => {
    const bytes = new TextEncoder().encode(
      "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
    );
    const scanned = await runUploadMalwareScan({ bytes, mimeType: "text/plain" });
    expect(scanned.ok).toBe(false);
  });
});
