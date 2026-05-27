import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logExecutivePermissionDenied = vi.hoisted(() => vi.fn());
const loadExecutiveOverview = vi.hoisted(() => vi.fn());
const persistExecutiveSnapshot = vi.hoisted(() => vi.fn());
const syncExecutiveInsights = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/executive/executive-permission-audit", () => ({
  logExecutivePermissionDenied,
}));
vi.mock("@/services/executive/executive-dashboard-service", () => ({
  loadExecutiveOverview,
  persistExecutiveSnapshot,
  syncExecutiveInsights,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { refreshExecutiveSnapshotAction } from "@/actions/executive";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view"]),
};

describe("executive actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logExecutivePermissionDenied.mockResolvedValue(undefined);
    loadExecutiveOverview.mockResolvedValue({ kpis: [], orderCount: 0 });
    persistExecutiveSnapshot.mockResolvedValue(undefined);
    syncExecutiveInsights.mockResolvedValue(undefined);
  });

  it("denies snapshot refresh without reports.read.operations", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await refreshExecutiveSnapshotAction({ periodType: "DAILY" });

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.operations");
    expect(loadExecutiveOverview).not.toHaveBeenCalled();
    expect(logExecutivePermissionDenied).toHaveBeenCalled();
  });
});
