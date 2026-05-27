import { describe, expect, it } from "vitest";

import {
  INVOICE_OCR_IMAGE_MAX_BYTES,
  validateInvoiceOcrImageUpload,
} from "@/lib/upload-policy/media-upload-validation";

describe("validateInvoiceOcrImageUpload", () => {
  it("rejects PDF uploads", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const result = validateInvoiceOcrImageUpload({ bytes, mimeType: "application/pdf" });
    expect(result.ok).toBe(false);
  });

  it("rejects oversize invoice photos", () => {
    const bytes = new Uint8Array(INVOICE_OCR_IMAGE_MAX_BYTES + 1);
    const result = validateInvoiceOcrImageUpload({ bytes, mimeType: "image/jpeg" });
    expect(result.ok).toBe(false);
  });

  it("accepts jpeg invoice images", () => {
    const bytes = new Uint8Array(64);
    const result = validateInvoiceOcrImageUpload({ bytes, mimeType: "image/jpeg" });
    expect(result.ok).toBe(true);
  });
});
