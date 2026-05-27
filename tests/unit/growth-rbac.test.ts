import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const canAccessGrowthModule = vi.hoisted(() => vi.fn());
const logGrowthPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
  requireSessionUser: vi.fn(),
}));
vi.mock("@/lib/growth/growth-permissions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/growth/growth-permissions")>();
  return {
    ...actual,
    canAccessGrowthModule,
  };
});
vi.mock("@/services/growth/growth-permission-audit", () => ({
  logGrowthPermissionDenied,
}));

import { authorizeGrowth } from "@/lib/growth/require-growth-access";
import { createGrowthActorScope } from "@/lib/growth/growth-actor-scope";
import { canUseGrowth } from "@/lib/growth/growth-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerActor = {
  sessionUserId: "staff-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: workspacePermissionsFromStaffTemplate("PACKER", "STAFF"),
};

describe("growth RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserProfile.mockResolvedValue({ role: "STAFF" });
    canAccessGrowthModule.mockResolvedValue(false);
    logGrowthPermissionDenied.mockResolvedValue(undefined);
  });

  it("denies growth.manage when canonical permission and legacy GTM access are missing", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: packerActor,
    });

    const res = await authorizeGrowth("growth.manage");

    expect(res.ok).toBe(false);
    expect(logGrowthPermissionDenied).toHaveBeenCalled();
  });

  it("allows growth.manage via legacy platform GTM bridge", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: packerActor,
    });
    canAccessGrowthModule.mockResolvedValue(true);

    const res = await authorizeGrowth("growth.manage");

    expect(res.ok).toBe(true);
  });

  it("allows growth.view when canonical growth.view is granted", async () => {
    const granted = new Set(packerActor.granted);
    granted.add("growth.view");
    const actor = { ...packerActor, granted };
    requireMutationPermission.mockResolvedValue({ ok: true, actor });
    requireUserProfile.mockResolvedValue({ role: "STAFF" });

    const scope = createGrowthActorScope(actor, "STAFF");
    expect(canUseGrowth(scope, "growth.view")).toBe(true);

    const res = await authorizeGrowth("growth.view");
    expect(res.ok).toBe(true);
  });
});
