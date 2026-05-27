import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const logBillingPermissionDenied = vi.hoisted(() => vi.fn());

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

import { requireBillingActor } from "@/lib/billing/require-billing-actor";

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

describe("requireBillingActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireWorkspacePermissionActor.mockResolvedValue(ownerActor);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "OWNER",
      email: "owner@example.com",
    });
    logBillingPermissionDenied.mockResolvedValue(undefined);
  });

  it("denies portal open without billing.manage mutation access", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: ownerActor,
    });

    const result = await requireBillingActor("billing.portal.open");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("permission");
    }
    expect(logBillingPermissionDenied).toHaveBeenCalled();
  });

  it("allows portal open for billing managers", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: ownerActor });

    const result = await requireBillingActor("billing.portal.open");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe("owner-1");
    }
    expect(logBillingPermissionDenied).not.toHaveBeenCalled();
  });

  it("denies checkout when neither canonical nor legacy capability grants apply", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: ownerActor });
    requireUserProfile.mockResolvedValue({
      id: "profile-2",
      role: "MANAGER",
      email: "mgr@example.com",
    });
    requireWorkspacePermissionActor.mockResolvedValue({
      ...ownerActor,
      workspaceRole: "MANAGER",
      granted: new Set(["billing.view"]),
    });

    const result = await requireBillingActor("billing.checkout");
    expect(result.ok).toBe(false);
    expect(logBillingPermissionDenied).toHaveBeenCalled();
  });
});
