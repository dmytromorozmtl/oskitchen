import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logLaborPermissionDenied = vi.hoisted(() => vi.fn());
const clockIn = vi.hoisted(() => vi.fn());
const clockOut = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/services/labor/labor-permission-audit", () => ({
  logLaborPermissionDenied,
}));
vi.mock("@/services/labor/time-clock-service", () => ({
  clockIn,
  clockOut,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { clockInAction, clockOutAction } from "@/actions/labor/time-clock";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "session-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "PACKER" as const,
  granted: new Set<string>(),
};

describe("labor time clock RBAC actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logLaborPermissionDenied.mockResolvedValue(undefined);
    clockIn.mockResolvedValue({});
    clockOut.mockResolvedValue({});
  });

  it("denies clock in without timeclock.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("staffId", "11111111-1111-4111-8111-111111111111");

    await expect(clockInAction(fd)).rejects.toThrow("You do not have permission");
    expect(requireMutationPermission).toHaveBeenCalledWith("timeclock.manage");
    expect(logLaborPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({ operation: "labor.clock_in" }),
    );
    expect(clockIn).not.toHaveBeenCalled();
  });

  it("allows clock out with timeclock.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    const fd = new FormData();
    fd.set("entryId", "22222222-2222-4222-8222-222222222222");

    await clockOutAction(fd);

    expect(clockOut).toHaveBeenCalledWith("22222222-2222-4222-8222-222222222222", "owner-1");
  });
});
