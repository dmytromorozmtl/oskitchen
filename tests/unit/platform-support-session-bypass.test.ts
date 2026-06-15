import { beforeEach, describe, expect, it, vi } from "vitest";

const workspaceFindFirst = vi.hoisted(() => vi.fn());
const platformUserRoleFindFirst = vi.hoisted(() => vi.fn());
const supportSessionCreate = vi.hoisted(() => vi.fn());
const supportSessionFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: { findFirst: workspaceFindFirst },
    platformUserRole: { findFirst: platformUserRoleFindFirst },
    platformSupportSession: {
      findMany: supportSessionFindMany,
      create: supportSessionCreate,
    },
  },
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn(),
}));

import {
  isWorkspaceOwnerSuperAdminProtected,
  startPlatformSupportSession,
} from "@/services/platform/platform-support-session-service";

describe("platform support session platform bypass", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supportSessionFindMany.mockResolvedValue([]);
  });

  it("does not treat workspace owner bootstrap email alone as superadmin-protected", async () => {
    workspaceFindFirst.mockResolvedValue({
      owner: { email: "workspace.moroz@gmail.com", id: "owner-1" },
    });
    platformUserRoleFindFirst.mockResolvedValue(null);

    await expect(isWorkspaceOwnerSuperAdminProtected("ws-1")).resolves.toBe(false);
    expect(platformUserRoleFindFirst).toHaveBeenCalledWith({
      where: { userId: "owner-1", role: "SUPER_ADMIN" },
      select: { id: true },
    });
  });

  it("treats workspace owner with SUPER_ADMIN role row as protected", async () => {
    workspaceFindFirst.mockResolvedValue({
      owner: { email: "workspace.moroz@gmail.com", id: "owner-1" },
    });
    platformUserRoleFindFirst.mockResolvedValue({ id: "role-1" });

    await expect(isWorkspaceOwnerSuperAdminProtected("ws-1")).resolves.toBe(true);
  });

  it("denies support session start on protected workspace when actor lacks SUPER_ADMIN role row", async () => {
    workspaceFindFirst.mockResolvedValue({
      id: "ws-1",
      ownerUserId: "owner-1",
      owner: { email: "workspace.moroz@gmail.com", id: "owner-1" },
    });
    platformUserRoleFindFirst
      .mockResolvedValueOnce({ id: "owner-role" })
      .mockResolvedValueOnce(null);

    const res = await startPlatformSupportSession({
      actorUserId: "actor-1",
      actorEmail: "workspace.moroz@gmail.com",
      workspaceId: "ws-1",
      reason: "customer escalation",
      mode: "READ_ONLY",
      ttlHours: 2,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("SUPER_ADMIN platform role");
    }
    expect(supportSessionCreate).not.toHaveBeenCalled();
  });

  it("allows support session start on protected workspace when actor has SUPER_ADMIN role row", async () => {
    workspaceFindFirst.mockResolvedValue({
      id: "ws-1",
      ownerUserId: "owner-1",
      owner: { email: "workspace.moroz@gmail.com", id: "owner-1" },
    });
    platformUserRoleFindFirst.mockResolvedValue({ id: "role-1" });
    supportSessionCreate.mockResolvedValue({
      id: "session-1",
      mode: "READ_ONLY",
      expiresAt: new Date(Date.now() + 3_600_000),
    });

    const res = await startPlatformSupportSession({
      actorUserId: "actor-1",
      actorEmail: "workspace.moroz@gmail.com",
      workspaceId: "ws-1",
      reason: "customer escalation",
      mode: "READ_ONLY",
      ttlHours: 2,
    });

    expect(res).toEqual({ ok: true, sessionId: "session-1" });
    expect(supportSessionCreate).toHaveBeenCalled();
  });
});
