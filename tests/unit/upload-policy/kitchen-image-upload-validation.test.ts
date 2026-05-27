import { describe, expect, it } from "vitest";

import {
  KITCHEN_RASTER_IMAGE_MAX_BYTES,
  kitchenRasterImageExtension,
  validateKitchenRasterImageUpload,
} from "@/lib/upload-policy/media-upload-validation";

describe("kitchen raster image upload validation", () => {
  it("accepts allowed raster image uploads", () => {
    const bytes = new Uint8Array([137, 80, 78, 71]);

    expect(
      validateKitchenRasterImageUpload({
        bytes,
        mimeType: "image/png",
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/png",
    });
  });

  it("rejects svg uploads even when declared as image/svg+xml", () => {
    const bytes = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>',
    );

    expect(
      validateKitchenRasterImageUpload({
        bytes,
        mimeType: "image/svg+xml",
      }),
    ).toEqual({
      ok: false,
      error: "Only JPEG, PNG, WebP, or GIF images are allowed.",
    });
  });

  it("rejects unsupported mime types such as mp4", () => {
    const bytes = new Uint8Array([0, 0, 0, 1]);

    expect(
      validateKitchenRasterImageUpload({
        bytes,
        mimeType: "video/mp4",
      }),
    ).toEqual({
      ok: false,
      error: "Only JPEG, PNG, WebP, or GIF images are allowed.",
    });
  });

  it("rejects oversized files", () => {
    const bytes = new Uint8Array(KITCHEN_RASTER_IMAGE_MAX_BYTES + 1);

    expect(
      validateKitchenRasterImageUpload({
        bytes,
        mimeType: "image/webp",
      }),
    ).toEqual({
      ok: false,
      error: "File too large (max 4MB).",
    });
  });

  it("maps validated mime types to storage extensions", () => {
    expect(kitchenRasterImageExtension("image/png")).toBe("png");
    expect(kitchenRasterImageExtension("image/webp")).toBe("webp");
    expect(kitchenRasterImageExtension("image/gif")).toBe("gif");
    expect(kitchenRasterImageExtension("image/jpeg")).toBe("jpg");
  });
});
