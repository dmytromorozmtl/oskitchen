import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceStorefrontRateLimit = vi.hoisted(() => vi.fn());
const resolveConfiguredStorefrontStorageProvider = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn());

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

vi.mock("@/lib/storefront/storefront-rate-limit", () => ({
  enforceStorefrontRateLimit,
}));

vi.mock("@/lib/storefront/storage-provider", () => ({
  resolveConfiguredStorefrontStorageProvider,
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

import { uploadStorefrontFormAttachment } from "@/services/storefront/storefront-form-upload-service";

describe("storefront form upload service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enforceStorefrontRateLimit.mockResolvedValue({ ok: true });
    resolveConfiguredStorefrontStorageProvider.mockReturnValue("SUPABASE");
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET = "storefront-media";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("rejects unsupported uploads before storage work", async () => {
    const result = await uploadStorefrontFormAttachment({
      storeSlug: "demo",
      formId: "form-1",
      fieldId: "attachment",
      fileName: "clip.mp4",
      contentType: "video/mp4",
      bytes: new Uint8Array([0, 0, 0, 1]),
    });

    expect(result).toEqual({
      ok: false,
      error: "File type not allowed (JPEG, PNG, WebP, PDF only).",
    });
    expect(createClient).not.toHaveBeenCalled();
  });
});
