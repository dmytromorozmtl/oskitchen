import { describe, expect, it } from "vitest";

import { STOREFRONT_FORM_FILE_MAX_BYTES } from "@/lib/storefront/forms";
import {
  storefrontFormAttachmentExtension,
  validateStorefrontFormAttachmentUpload,
} from "@/lib/upload-policy/media-upload-validation";

describe("storefront form attachment upload validation", () => {
  it("accepts allowed image and pdf uploads", () => {
    const bytes = new Uint8Array([137, 80, 78, 71]);

    expect(
      validateStorefrontFormAttachmentUpload({
        bytes,
        mimeType: "image/png",
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/png",
    });
  });

  it("accepts pdf uploads with a valid header", () => {
    const bytes = new TextEncoder().encode("%PDF-1.4 sample");

    expect(
      validateStorefrontFormAttachmentUpload({
        bytes,
        mimeType: "application/pdf",
      }),
    ).toEqual({
      ok: true,
      mimeType: "application/pdf",
    });
  });

  it("rejects unsupported mime types such as mp4", () => {
    const bytes = new Uint8Array([0, 0, 0, 1]);

    expect(
      validateStorefrontFormAttachmentUpload({
        bytes,
        mimeType: "video/mp4",
      }),
    ).toEqual({
      ok: false,
      error: "File type not allowed (JPEG, PNG, WebP, PDF only).",
    });
  });

  it("rejects empty files", () => {
    expect(
      validateStorefrontFormAttachmentUpload({
        bytes: new Uint8Array(),
        mimeType: "image/jpeg",
      }),
    ).toEqual({
      ok: false,
      error: "File is empty.",
    });
  });

  it("rejects oversized files", () => {
    const bytes = new Uint8Array(STOREFRONT_FORM_FILE_MAX_BYTES + 1);

    expect(
      validateStorefrontFormAttachmentUpload({
        bytes,
        mimeType: "image/webp",
      }),
    ).toEqual({
      ok: false,
      error: "File too large (max 5MB).",
    });
  });

  it("rejects pdf uploads without a pdf header", () => {
    const bytes = new TextEncoder().encode("not-a-pdf");

    expect(
      validateStorefrontFormAttachmentUpload({
        bytes,
        mimeType: "application/pdf",
      }),
    ).toEqual({
      ok: false,
      error: "Invalid PDF file.",
    });
  });

  it("maps validated mime types to storage extensions", () => {
    expect(storefrontFormAttachmentExtension("image/png")).toBe("png");
    expect(storefrontFormAttachmentExtension("image/webp")).toBe("webp");
    expect(storefrontFormAttachmentExtension("application/pdf")).toBe("pdf");
    expect(storefrontFormAttachmentExtension("image/jpeg")).toBe("jpg");
  });
});
