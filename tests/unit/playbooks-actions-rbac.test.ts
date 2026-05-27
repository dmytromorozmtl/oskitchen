import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logPlaybookPermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const startPlaybookRun = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/playbooks/playbook-permission-audit", () => ({
  logPlaybookPermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    playbook: { findFirst: vi.fn().mockResolvedValue({ id: "pb-1" }) },
    kitchenSettings: { findUnique: vi.fn().mockResolvedValue({ businessType: null }) },
  },
}));
vi.mock("@/services/playbooks/playbook-service", () => ({
  startPlaybookRun,
  ensureSystemPlaybooks: vi.fn(),
  transitionRunStep: vi.fn(),
  completeRun: vi.fn(),
  cancelRun: vi.fn(),
  createPlaybookFromSeed: vi.fn(),
  archivePlaybook: vi.fn(),
  recordPlaybookEvent: vi.fn(),
}));
vi.mock("@/services/playbooks/playbook-task-generator", () => ({
  generateTasksForRun: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { startRunAction } from "@/actions/playbooks";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["workspace.view"]),
};

describe("playbooks actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logPlaybookPermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "packer",
      email: "packer@example.com",
    });
    startPlaybookRun.mockResolvedValue({ id: "run-1" });
  });

  it("denies starting a run without playbooks.participate", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await startRunAction({
      playbookId: "00000000-0000-4000-8000-000000000001",
    });

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("playbooks.participate");
    expect(startPlaybookRun).not.toHaveBeenCalled();
    expect(logPlaybookPermissionDenied).toHaveBeenCalled();
  });
});
