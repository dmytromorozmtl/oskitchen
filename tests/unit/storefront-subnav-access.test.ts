import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("resolveStorefrontSubnavVisibleHrefs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSessionUser.mockResolvedValue({ id: "staff-1" });
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

  it("hides settings admin tabs when canonical storefront.manage is missing", async () => {
    const granted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");
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
        granted,
      },
    };

    const visible = await resolveStorefrontSubnavVisibleHrefs(hub);

    expect(visible).toContain("/dashboard/storefront");
    expect(visible).toContain("/dashboard/storefront/preview");
    expect(visible).not.toContain("/dashboard/storefront/settings");
    expect(visible).not.toContain("/dashboard/storefront/discounts");
    expect(visible).not.toContain("/dashboard/storefront/launch");
    expect(visible).not.toContain("/dashboard/storefront/team");
  });

  it("shows discounts when storefront.manage is granted without storefront.settings", async () => {
    legacyStorefrontAllowsForActor.mockImplementation(async (_actor, key: string) => {
      return key === "storefront.manage";
    });
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
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const hub = {
      canRead: true,
      canManage: true,
      canPublish: false,
      canManageMedia: false,
      actor: {
        sessionUserId: "staff-1",
        userId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF" as const,
        staffRoleType: "MANAGER" as const,
        email: "manager@example.com",
        granted,
      },
    };

    const visible = await resolveStorefrontSubnavVisibleHrefs(hub);

    expect(visible).toContain("/dashboard/storefront/discounts");
    expect(visible).not.toContain("/dashboard/storefront/settings");
  });

  it("shows team tab when storefront.manage and staff storefront.team are granted", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    legacyStorefrontAllowsForActor.mockImplementation(async (_actor, key: string) => {
      return key === "storefront.manage";
    });
    resolveStorefrontAdminAccess.mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.team", "storefront.settings"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
    const hub = {
      canRead: true,
      canManage: true,
      canPublish: false,
      canManageMedia: false,
      actor: {
        sessionUserId: "staff-1",
        userId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF" as const,
        staffRoleType: "MANAGER" as const,
        email: "manager@example.com",
        granted,
      },
    };

    const visible = await resolveStorefrontSubnavVisibleHrefs(hub);

    expect(visible).toContain("/dashboard/storefront/team");
    expect(visible).toContain("/dashboard/storefront/settings");
    expect(visible).not.toContain("/dashboard/storefront/theme");
  });
});
