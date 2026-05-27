import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const getStorefrontPermissionSetForUser = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/storefront/storefront-permission-service", () => ({
  getStorefrontPermissionSetForUser,
}));
vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));

import * as storefrontAdminAccess from "@/lib/storefront/storefront-admin-access";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "staff-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view", "storefront.read"]),
};

describe("storefront admin access RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logStorefrontPermissionDenied.mockResolvedValue(undefined);
    getStorefrontPermissionSetForUser.mockResolvedValue({
      role: "STAFF",
      email: "packer@example.com",
      permissions: new Set(["storefront:view"]),
    });
    vi.spyOn(storefrontAdminAccess, "resolveStorefrontAdminAccess").mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.catalog"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
  });

  it("denies catalog mutations without storefront.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    await expect(
      storefrontAdminAccess.requireStorefrontAdminPermissionForUser("staff-1", "storefront.catalog"),
    ).rejects.toThrow("You do not have permission");
    expect(requireMutationPermission).toHaveBeenCalledWith("storefront.manage");
    expect(storefrontAdminAccess.resolveStorefrontAdminAccess).not.toHaveBeenCalled();
    expect(logStorefrontPermissionDenied).toHaveBeenCalled();
  });
});
