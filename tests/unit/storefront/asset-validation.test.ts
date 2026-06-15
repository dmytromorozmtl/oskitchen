import { describe, expect, it } from "vitest";

import { STOREFRONT_MEDIA_MAX_BYTES, validateStorefrontMediaUpload } from "@/lib/storefront/asset-validation";

describe("storefront asset validation", () => {
  it("accepts safe raster image uploads", () => {
    const bytes = new Uint8Array([137, 80, 78, 71]);

    expect(
      validateStorefrontMediaUpload({
        bytes,
        mimeType: "image/png",
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/png",
    });
  });

  it("rejects unsupported mime types such as mp4", () => {
    const bytes = new Uint8Array([0, 0, 0, 1]);

    expect(
      validateStorefrontMediaUpload({
        bytes,
        mimeType: "video/mp4",
      }),
    ).toEqual({
      ok: false,
      error: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed.",
    });
  });

  it("rejects oversized files", () => {
    const bytes = new Uint8Array(STOREFRONT_MEDIA_MAX_BYTES + 1);

    expect(
      validateStorefrontMediaUpload({
        bytes,
        mimeType: "image/webp",
      }),
    ).toEqual({
      ok: false,
      error: "File too large (max 8MB).",
    });
  });

  it("rejects svg files with active script content", () => {
    const bytes = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );

    expect(
      validateStorefrontMediaUpload({
        bytes,
        mimeType: "image/svg+xml",
      }),
    ).toEqual({
      ok: false,
      error: "SVG files with scripts, event handlers, or embedded active content are not allowed.",
    });
  });

  it("accepts simple svg files without active content", () => {
    const bytes = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>',
    );

    expect(
      validateStorefrontMediaUpload({
        bytes,
        mimeType: "image/svg+xml",
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/svg+xml",
    });
  });
});
