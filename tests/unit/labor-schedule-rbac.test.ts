import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logLaborPermissionDenied = vi.hoisted(() => vi.fn());
const createScheduledShift = vi.hoisted(() => vi.fn());
const deleteScheduledShift = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/labor/labor-permission-audit", () => ({
  logLaborPermissionDenied,
}));
vi.mock("@/services/labor/schedule-service", () => ({
  createScheduledShift,
  updateScheduledShift: vi.fn(),
  deleteScheduledShift,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createShiftAction, deleteShiftAction } from "@/actions/labor/schedule";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  granted: new Set<string>(),
};

describe("labor schedule RBAC actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logLaborPermissionDenied.mockResolvedValue(undefined);
    createScheduledShift.mockResolvedValue({ ok: true });
    deleteScheduledShift.mockResolvedValue(undefined);
  });

  it("denies create shift without schedule.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("staffMemberId", "11111111-1111-4111-8111-111111111111");
    fd.set("shiftDate", "2026-05-26");
    fd.set("startTime", "09:00");
    fd.set("endTime", "17:00");

    await expect(createShiftAction(fd)).rejects.toThrow("You do not have permission");
    expect(requireMutationPermission).toHaveBeenCalledWith("schedule.manage");
    expect(logLaborPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({ operation: "labor.create_shift" }),
    );
    expect(createScheduledShift).not.toHaveBeenCalled();
  });

  it("allows delete shift with schedule.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("shiftId", "22222222-2222-4222-8222-222222222222");

    await deleteShiftAction(fd);

    expect(deleteScheduledShift).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "owner-1",
    );
  });
});
