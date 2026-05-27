import { beforeEach, describe, expect, it, vi } from "vitest";

import { canAccessStorefrontLoyaltyTab } from "@/lib/storefront/storefront-loyalty-permission";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireSessionUser = vi.hoisted(() => vi.fn());
const resolveStorefrontAdminAccess = vi.hoisted(() => vi.fn());
const legacyStorefrontAllowsForActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ requireSessionUser }));
vi.mock("@/lib/storefront/storefront-admin-access", () => ({
  resolveStorefrontAdminAccess,
}));
vi.mock("@/lib/storefront/require-storefront-actor", () => ({
  legacyStorefrontAllowsForActor,
}));

import { resolveStorefrontSubnavVisibleHrefs } from "@/lib/storefront/storefront-subnav-access";

function granted(...keys: PermissionKey[]) {
  return new Set(keys) as ReadonlySet<PermissionKey>;
}

describe("storefront loyalty RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    legacyStorefrontAllowsForActor.mockResolvedValue(false);
    requireSessionUser.mockResolvedValue({ id: "staff-1" });
    resolveStorefrontAdminAccess.mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.orders"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
  });

  it("gates loyalty tab on loyalty.manage and storefront read", () => {
    expect(canAccessStorefrontLoyaltyTab(granted("loyalty.manage"), true)).toBe(true);
    expect(canAccessStorefrontLoyaltyTab(granted("storefront.read"), true)).toBe(false);
    expect(canAccessStorefrontLoyaltyTab(granted("loyalty.manage"), false)).toBe(false);
  });

  it("shows loyalty subnav for marketing staff with loyalty.manage", async () => {
    const staffGranted = workspacePermissionsFromStaffTemplate("MARKETING", "STAFF");
    const hub = {
      canRead: true,
      canManage: false,
      canPublish: false,
      canManageMedia: false,
      actor: {
        sessionUserId: "staff-1",
        userId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF" as const,
        staffRoleType: "MARKETING" as const,
        email: "marketing@example.com",
        granted: staffGranted,
      },
    };

    const visible = await resolveStorefrontSubnavVisibleHrefs(hub);

    expect(visible).toContain("/dashboard/storefront/loyalty");
    expect(visible).not.toContain("/dashboard/storefront/settings");
  });

  it("hides loyalty subnav without loyalty.manage", async () => {
    const staffGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");
    const hub = {
      canRead: true,
      canManage: false,
      canPublish: false,
      canManageMedia: false,
      actor: {
        sessionUserId: "staff-1",
        userId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF" as const,
        staffRoleType: "PACKER" as const,
        email: "packer@example.com",
        granted: staffGranted,
      },
    };

    const visible = await resolveStorefrontSubnavVisibleHrefs(hub);

    expect(visible).not.toContain("/dashboard/storefront/loyalty");
  });
});
