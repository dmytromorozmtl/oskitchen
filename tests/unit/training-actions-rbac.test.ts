import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logTrainingPermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const createProgram = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/training/training-permission-audit", () => ({
  logTrainingPermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/services/training/training-service", () => ({
  createProgram,
  assignProgram: vi.fn(),
  recordProgress: vi.fn(),
  submitQuizAttempt: vi.fn(),
  issueCertification: vi.fn(),
  revokeCertification: vi.fn(),
  createSimulation: vi.fn(),
  runSimulation: vi.fn(),
  createSop: vi.fn(),
  publishSop: vi.fn(),
  archiveSop: vi.fn(),
  acknowledgeSop: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createProgramAction } from "@/actions/training";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  email: "packer@example.com",
  granted: new Set(["training.participate"]),
};

describe("training actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logTrainingPermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({ id: "profile-1", role: "packer", email: "packer@example.com" });
    createProgram.mockResolvedValue(undefined);
  });

  it("denies program create without training.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("title", "Onboarding");

    await expect(createProgramAction(fd)).rejects.toThrow("You do not have permission");
    expect(requireMutationPermission).toHaveBeenCalledWith("training.manage");
    expect(createProgram).not.toHaveBeenCalled();
  });
});
