import { beforeEach, describe, expect, it, vi } from "vitest";

const assertStorefrontAssetUploadAllowed = vi.hoisted(() => vi.fn());
const resolveConfiguredStorefrontStorageProvider = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  storefrontAsset: { create: vi.fn() },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/storefront/storefront-asset-service", () => ({
  assertStorefrontAssetUploadAllowed,
}));

vi.mock("@/lib/storefront/storage-provider", () => ({
  resolveConfiguredStorefrontStorageProvider,
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

import { uploadStorefrontMediaAsset } from "@/services/storefront/storefront-media-upload-service";

describe("storefront media upload service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertStorefrontAssetUploadAllowed.mockResolvedValue({ ok: true });
    resolveConfiguredStorefrontStorageProvider.mockReturnValue("SUPABASE");
  });

  it("rejects unsafe svg uploads before storage or database work", async () => {
    const result = await uploadStorefrontMediaAsset({
      userId: "owner-1",
      storefrontId: "sf-1",
      fileName: "unsafe.svg",
      contentType: "image/svg+xml",
      bytes: new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10"/></svg>',
      ),
    });

    expect(result).toEqual({
      ok: false,
      error: "SVG files with scripts, event handlers, or embedded active content are not allowed.",
    });
    expect(createClient).not.toHaveBeenCalled();
    expect(prismaMock.storefrontAsset.create).not.toHaveBeenCalled();
  });
});
