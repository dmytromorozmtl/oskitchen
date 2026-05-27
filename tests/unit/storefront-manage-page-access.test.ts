import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const getStorefrontPermissionSetForUser = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/components/dashboard/pos-access-card", () => ({
  PosAccessCard: () => null,
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/services/storefront/storefront-permission-service", () => ({
  getStorefrontPermissionSetForUser,
}));

vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));

import { requireStorefrontManagePage } from "@/lib/storefront/storefront-page-access";

describe("requireStorefrontManagePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logStorefrontPermissionDenied.mockResolvedValue(undefined);
  });

  it("denies domains route for read-only staff and audits", async () => {
    const actor = {
      sessionUserId: "staff-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      email: "viewer@example.com",
      workspaceRole: "STAFF" as const,
      staffRoleType: "VIEWER" as const,
      granted: new Set(["storefront.read"]),
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);
    getStorefrontPermissionSetForUser.mockResolvedValue({
      permissions: new Set(["storefront:view"]),
      email: actor.email,
    });

    const access = await requireStorefrontManagePage({
      operation: "storefront.domains.view",
      route: "/dashboard/storefront/domains",
    });

    expect(access.ok).toBe(false);
    expect(logStorefrontPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "storefront.manage",
        operation: "storefront.domains.view",
        metadata: { route: "/dashboard/storefront/domains" },
      }),
    );
  });
});
