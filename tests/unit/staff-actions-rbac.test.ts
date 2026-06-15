import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logStaffPermissionDenied = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const createStaffMember = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/staff/staff-permission-audit", () => ({
  logStaffPermissionDenied,
}));
vi.mock("@/lib/auth", () => ({
  requireUserProfile,
}));
vi.mock("@/services/staff/staff-service", () => ({
  createStaffMember,
  updateStaffMember: vi.fn(),
  archiveStaffMember: vi.fn(),
  deactivateRole: vi.fn(),
  revokeCertification: vi.fn(),
  saveAvailability: vi.fn(),
  createShift: vi.fn(),
  transitionShiftStatus: vi.fn(),
  upsertCertification: vi.fn(),
  upsertRole: vi.fn(),
}));
vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createStaffAction } from "@/actions/staff";
import { createStaffMemberAction } from "@/actions/staff-member";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("staff actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logStaffPermissionDenied.mockResolvedValue(undefined);
    requireUserProfile.mockResolvedValue({ id: "profile-1", role: "staff", email: "cook@example.com" });
    createStaffMember.mockResolvedValue({ id: "staff-1" });
  });

  it("denies createStaffAction without staff.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("name", "Alex");

    await expect(createStaffAction(fd)).rejects.toThrow("You do not have permission");
    expect(logStaffPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({ operation: "staff.create" }),
    );
    expect(createStaffMember).not.toHaveBeenCalled();
  });

  it("denies quick create without staff.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("name", "Alex");

    const result = await createStaffMemberAction(fd);
    expect(result).toEqual({ error: "You do not have permission to perform this action." });
  });
});
