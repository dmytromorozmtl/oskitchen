import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionUser = vi.hoisted(() => vi.fn());
const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const resolveStorefrontAdminAccess = vi.hoisted(() => vi.fn());
const legacyStorefrontAllowsForActor = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ requireSessionUser }));
vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));
vi.mock("@/lib/storefront/storefront-admin-access", () => ({
  resolveStorefrontAdminAccess,
}));
vi.mock("@/lib/storefront/require-storefront-actor", () => ({
  legacyStorefrontAllowsForActor,
}));
vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));
vi.mock("@/components/dashboard/pos-access-card", () => ({
  PosAccessCard: () => null,
}));

import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("requireStorefrontAdminPageAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSessionUser.mockResolvedValue({ id: "staff-1" });
    logStorefrontPermissionDenied.mockResolvedValue(undefined);
    legacyStorefrontAllowsForActor.mockResolvedValue(false);
    resolveStorefrontAdminAccess.mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.team"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
  });

  it("denies team page when canonical storefront.manage is missing", async () => {
    const granted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");
    const actor = {
      sessionUserId: "staff-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "PACKER" as const,
      email: "packer@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const result = await requireStorefrontAdminPageAccess("storefront.team");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.deny).toBeTruthy();
    }
    expect(resolveStorefrontAdminAccess).not.toHaveBeenCalled();
    expect(logStorefrontPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "storefront.manage",
        operation: "storefront.admin.page.storefront.team",
      }),
    );
  });
});
