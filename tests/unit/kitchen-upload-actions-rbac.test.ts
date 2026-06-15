import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const uploadKitchenAsset = vi.hoisted(() => vi.fn());
const logUploadDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/storage", () => ({
  uploadKitchenAsset,
}));

vi.mock("@/services/audit/upload-audit", () => ({
  logUploadDenied,
  logUploadSucceeded: vi.fn(),
}));

import { uploadProductImageAction } from "@/actions/upload";

describe("kitchen upload actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "user-1" },
      workspaceId: "ws-1",
    });
    logUploadDenied.mockResolvedValue(undefined);
  });

  it("denies product image upload without products.edit", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "x.jpg", { type: "image/jpeg" }));

    const result = await uploadProductImageAction(fd);
    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(uploadKitchenAsset).not.toHaveBeenCalled();
  });
});
