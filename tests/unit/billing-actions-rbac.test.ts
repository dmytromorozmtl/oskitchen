import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const logBillingPermissionDenied = vi.hoisted(() => vi.fn());
const setEntitlementOverride = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));

vi.mock("@/services/billing/billing-permission-audit", () => ({
  logBillingPermissionDenied,
}));

vi.mock("@/services/billing/entitlement-service", () => ({
  setEntitlementOverride,
  clearEntitlementOverride: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { setEntitlementOverrideAction } from "@/actions/billing";

const ownerActor = {
  sessionUser: { id: "profile-1" },
  sessionUserId: "session-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  email: "owner@example.com",
  workspaceRole: "OWNER" as const,
  staffRoleType: null,
  granted: new Set(["billing.view", "billing.manage"]),
};

describe("billing actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireWorkspacePermissionActor.mockResolvedValue(ownerActor);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "OWNER",
      email: "owner@example.com",
    });
    setEntitlementOverride.mockResolvedValue(undefined);
    logBillingPermissionDenied.mockResolvedValue(undefined);
  });

  it("denies entitlement overrides without billing.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: ownerActor,
    });

    const fd = new FormData();
    fd.set("featureKey", "storefront");
    fd.set("value", "true");

    await expect(setEntitlementOverrideAction(fd)).rejects.toThrow(
      "You do not have permission to perform this action.",
    );
    expect(logBillingPermissionDenied).toHaveBeenCalledWith(
      ownerActor,
      expect.objectContaining({
        billingCapability: "billing.override.write",
        requiredPermission: "billing.manage",
      }),
    );
    expect(setEntitlementOverride).not.toHaveBeenCalled();
  });

  it("allows entitlement overrides for billing managers", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: ownerActor });

    const fd = new FormData();
    fd.set("featureKey", "storefront");
    fd.set("value", "true");

    await expect(setEntitlementOverrideAction(fd)).resolves.toBeUndefined();
    expect(setEntitlementOverride).toHaveBeenCalled();
    expect(logBillingPermissionDenied).not.toHaveBeenCalled();
  });
});
