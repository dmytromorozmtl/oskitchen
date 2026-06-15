import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  canAccessStorefrontGiftCardsTab,
  canAccessStorefrontLoyaltyTab,
  canAccessStorefrontRewardsTab,
  storefrontRewardsPermission,
} from "@/lib/storefront/storefront-rewards-permission";
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

describe("storefront rewards RBAC", () => {
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

  it("maps modules to canonical permissions", () => {
    expect(storefrontRewardsPermission("gift_cards")).toBe("giftcards.manage");
    expect(storefrontRewardsPermission("loyalty")).toBe("loyalty.manage");
  });

  it("gates gift cards and loyalty tabs independently", () => {
    expect(canAccessStorefrontGiftCardsTab(granted("giftcards.manage"), true)).toBe(true);
    expect(canAccessStorefrontLoyaltyTab(granted("giftcards.manage"), true)).toBe(false);
    expect(canAccessStorefrontRewardsTab("loyalty", granted("loyalty.manage"), true)).toBe(true);
  });

  it("shows rewards subnav for marketing staff", async () => {
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

    expect(visible).toContain("/dashboard/storefront/gift-cards");
    expect(visible).toContain("/dashboard/storefront/loyalty");
    expect(resolveStorefrontAdminAccess).toHaveBeenCalledTimes(1);
  });

  it("hides rewards subnav without manage permissions", async () => {
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

    expect(visible).not.toContain("/dashboard/storefront/gift-cards");
    expect(visible).not.toContain("/dashboard/storefront/loyalty");
  });
});
