import { afterEach, describe, expect, it } from "vitest";

import {
  createStorefrontPreviewToken,
  hasStorefrontPreviewAccess,
} from "@/lib/storefront/preview-token";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("storefront preview access", () => {
  it("allows the owner session without requiring a preview token", () => {
    expect(
      hasStorefrontPreviewAccess({
        ownerUserId: "owner-1",
        storeSlug: "demo-store",
        viewerUserId: "owner-1",
        previewToken: null,
      }),
    ).toBe(true);
  });

  it("allows a valid signed preview token for the matching store slug", () => {
    process.env.STOREFRONT_PREVIEW_SECRET = "preview-secret-long-enough";

    const token = createStorefrontPreviewToken("owner-1", "demo-store");
    expect(token).toBeTruthy();

    expect(
      hasStorefrontPreviewAccess({
        ownerUserId: "owner-1",
        storeSlug: "demo-store",
        viewerUserId: null,
        previewToken: token,
      }),
    ).toBe(true);
  });

  it("rejects preview tokens for another store or another owner", () => {
    process.env.STOREFRONT_PREVIEW_SECRET = "preview-secret-long-enough";

    const token = createStorefrontPreviewToken("owner-1", "demo-store");
    expect(token).toBeTruthy();

    expect(
      hasStorefrontPreviewAccess({
        ownerUserId: "owner-1",
        storeSlug: "other-store",
        viewerUserId: null,
        previewToken: token,
      }),
    ).toBe(false);

    expect(
      hasStorefrontPreviewAccess({
        ownerUserId: "owner-2",
        storeSlug: "demo-store",
        viewerUserId: null,
        previewToken: token,
      }),
    ).toBe(false);
  });
});
