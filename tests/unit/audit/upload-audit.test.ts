import { beforeEach, describe, expect, it, vi } from "vitest";

const auditLog = vi.hoisted(() => vi.fn());
const resolveWorkspaceIdForOwner = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  storefrontSettings: { findFirst: vi.fn() },
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog,
  resolveWorkspaceIdForOwner,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";

describe("upload audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditLog.mockResolvedValue(undefined);
    resolveWorkspaceIdForOwner.mockResolvedValue("ws-owner");
    prismaMock.storefrontSettings.findFirst.mockResolvedValue({ userId: "owner-1" });
  });

  it("logs denied kitchen uploads for authenticated owners", async () => {
    await logUploadDenied({
      channel: "kitchen_product_image",
      actorUserId: "owner-1",
      workspaceId: "ws-1",
      reason: "Only JPEG, PNG, WebP, or GIF images are allowed.",
      mimeType: "video/mp4",
      sizeBytes: 12,
    });

    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        action: AUDIT_ACTIONS.UPLOAD_DENIED,
        category: "SECURITY",
        source: "USER",
        severity: "WARNING",
        metadata: expect.objectContaining({
          channel: "kitchen_product_image",
          reason: "Only JPEG, PNG, WebP, or GIF images are allowed.",
        }),
      }),
    );
  });

  it("resolves workspace from store slug for public form uploads", async () => {
    await logUploadDenied({
      channel: "storefront_form_attachment",
      reason: "File too large (max 5MB).",
      metadata: { storeSlug: "demo-bistro", fieldId: "menu" },
      source: "API",
    });

    expect(prismaMock.storefrontSettings.findFirst).toHaveBeenCalledWith({
      where: { storeSlug: "demo-bistro" },
      select: { userId: true },
    });
    expect(resolveWorkspaceIdForOwner).toHaveBeenCalledWith("owner-1");
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-owner",
        action: AUDIT_ACTIONS.UPLOAD_DENIED,
        source: "API",
      }),
    );
  });

  it("logs successful storefront media uploads", async () => {
    await logUploadSucceeded({
      channel: "storefront_media",
      actorUserId: "owner-1",
      workspaceId: "ws-1",
      assetId: "asset-1",
      publicUrl: "https://cdn.example/asset-1.png",
      mimeType: "image/png",
      sizeBytes: 1024,
    });

    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AUDIT_ACTIONS.UPLOAD_SUCCEEDED,
        severity: "INFO",
        metadata: expect.objectContaining({
          channel: "storefront_media",
          assetId: "asset-1",
          hasPublicUrl: true,
        }),
      }),
    );
  });
});
