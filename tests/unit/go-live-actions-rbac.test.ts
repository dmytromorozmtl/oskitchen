import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logGoLivePermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const createProject = vi.hoisted(() => vi.fn());
const refreshAutoValidation = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/go-live/go-live-permission-audit", () => ({
  logGoLivePermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/services/go-live/go-live-service", () => ({
  createProject,
  refreshAutoValidation,
  createIncident: vi.fn(),
  createRollbackPlan: vi.fn(),
  recordApproval: vi.fn(),
  runSimulationForProject: vi.fn(),
  transitionStatus: vi.fn(),
  updateChecklistItem: vi.fn(),
  updateIncident: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createGoLiveProjectAction } from "@/actions/go-live";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view"]),
};

describe("go-live actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logGoLivePermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "packer",
      email: "packer@example.com",
    });
    createProject.mockResolvedValue({ id: "project-1" });
    refreshAutoValidation.mockResolvedValue(undefined);
  });

  it("denies project create without go-live.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("launchMode", "SOFT");

    await expect(createGoLiveProjectAction(fd)).rejects.toThrow(
      "You do not have permission",
    );
    expect(requireMutationPermission).toHaveBeenCalledWith("go-live.manage");
    expect(createProject).not.toHaveBeenCalled();
    expect(logGoLivePermissionDenied).toHaveBeenCalled();
  });
});
