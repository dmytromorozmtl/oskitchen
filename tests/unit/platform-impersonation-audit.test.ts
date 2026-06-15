import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const cookiesMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const requireSessionUser = vi.hoisted(() => vi.fn());
const requireSuperAdmin = vi.hoisted(() => vi.fn());
const isTargetSuperAdminProtected = vi.hoisted(() => vi.fn());
const verifyImpersonationMfa = vi.hoisted(() => vi.fn());
const recordPlatformAudit = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  workspace: { findFirst: vi.fn() },
  workspaceMember: { findFirst: vi.fn() },
  impersonationSession: {
    create: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/auth", () => ({ requireSessionUser }));
vi.mock("@/lib/platform-admin", () => ({
  requireSuperAdmin,
  isTargetSuperAdminProtected,
}));
vi.mock("@/lib/platform/impersonation-mfa", () => ({ verifyImpersonationMfa }));
vi.mock("@/lib/platform-audit", () => ({ recordPlatformAudit }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  endPlatformImpersonation,
  startPlatformImpersonation,
} from "@/actions/platform-impersonation";

describe("platform impersonation audit trail", () => {
  const cookieJar = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue(cookieJar);
    requireSuperAdmin.mockResolvedValue({ id: "admin-1" });
    requireSessionUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com" });
    isTargetSuperAdminProtected.mockResolvedValue(false);
    verifyImpersonationMfa.mockReturnValue(true);
    prismaMock.workspace.findFirst.mockResolvedValue({ id: "ws-target" });
    prismaMock.workspaceMember.findFirst.mockResolvedValue(null);
    prismaMock.impersonationSession.create.mockResolvedValue({ id: "imp-1" });
    prismaMock.impersonationSession.findFirst.mockResolvedValue({
      id: "imp-1",
      targetUserId: "user-1",
    });
    prismaMock.impersonationSession.updateMany.mockResolvedValue({ count: 1 });
  });

  it("records audit metadata when impersonation starts", async () => {
    const result = await startPlatformImpersonation(
      "user-1",
      " Need support access ",
      "step-token",
    );

    expect(result).toEqual({ ok: true });
    expect(prismaMock.impersonationSession.create).toHaveBeenCalledWith({
      data: {
        adminUserId: "admin-1",
        targetUserId: "user-1",
        reason: "Need support access",
      },
    });
    expect(cookieJar.set).toHaveBeenCalled();
    expect(recordPlatformAudit).toHaveBeenCalledWith({
      adminUserId: "admin-1",
      action: "platform.impersonation.start",
      entityType: "user",
      entityId: "user-1",
      targetWorkspaceId: "ws-target",
      metadata: {
        sessionId: "imp-1",
        reason: "Need support access",
        targetUserId: "user-1",
      },
    });
  });

  it("falls back to workspace membership when target owns no workspace", async () => {
    prismaMock.workspace.findFirst.mockResolvedValue(null);
    prismaMock.workspaceMember.findFirst.mockResolvedValue({ workspaceId: "ws-member" });

    const result = await startPlatformImpersonation("user-1", "Need support access", "step-token");

    expect(result).toEqual({ ok: true });
    expect(recordPlatformAudit).toHaveBeenCalledWith({
      adminUserId: "admin-1",
      action: "platform.impersonation.start",
      entityType: "user",
      entityId: "user-1",
      targetWorkspaceId: "ws-member",
      metadata: {
        sessionId: "imp-1",
        reason: "Need support access",
        targetUserId: "user-1",
      },
    });
  });

  it("records null workspace metadata when the target has no resolvable workspace", async () => {
    prismaMock.workspace.findFirst.mockResolvedValue(null);
    prismaMock.workspaceMember.findFirst.mockResolvedValue(null);

    const result = await startPlatformImpersonation("user-1", "Need support access", "step-token");

    expect(result).toEqual({ ok: true });
    expect(recordPlatformAudit).toHaveBeenCalledWith({
      adminUserId: "admin-1",
      action: "platform.impersonation.start",
      entityType: "user",
      entityId: "user-1",
      targetWorkspaceId: null,
      metadata: {
        sessionId: "imp-1",
        reason: "Need support access",
        targetUserId: "user-1",
      },
    });
  });

  it("refuses to start impersonation without MFA proof", async () => {
    verifyImpersonationMfa.mockReturnValue(false);

    const result = await startPlatformImpersonation("user-1", "support");

    expect(result).toEqual({
      ok: false,
      error: "Impersonation requires a valid MFA code or step-up token.",
    });
    expect(prismaMock.impersonationSession.create).not.toHaveBeenCalled();
    expect(recordPlatformAudit).not.toHaveBeenCalled();
  });

  it("refuses to start impersonation for protected super-admin targets", async () => {
    isTargetSuperAdminProtected.mockResolvedValue(true);

    const result = await startPlatformImpersonation("user-1", "support", "step-token");

    expect(result).toEqual({
      ok: false,
      error: "Cannot impersonate another platform super-admin.",
    });
    expect(prismaMock.impersonationSession.create).not.toHaveBeenCalled();
    expect(cookieJar.set).not.toHaveBeenCalled();
    expect(recordPlatformAudit).not.toHaveBeenCalled();
  });

  it("records end-of-session audit metadata when impersonation stops", async () => {
    cookieJar.get.mockReturnValue({ value: "imp-1" });

    await endPlatformImpersonation();

    expect(prismaMock.impersonationSession.findFirst).toHaveBeenCalledWith({
      where: { id: "imp-1", adminUserId: "admin-1", endedAt: null },
      select: { id: true, targetUserId: true },
    });
    expect(prismaMock.impersonationSession.updateMany).toHaveBeenCalledWith({
      where: { id: "imp-1", adminUserId: "admin-1", endedAt: null },
      data: { endedAt: expect.any(Date) },
    });
    expect(cookieJar.delete).toHaveBeenCalled();
    expect(recordPlatformAudit).toHaveBeenCalledWith({
      adminUserId: "admin-1",
      action: "platform.impersonation.end",
      entityType: "impersonation_session",
      entityId: "imp-1",
      metadata: {
        targetUserId: "user-1",
        sessionId: "imp-1",
      },
    });
  });

  it("records a bounded end audit even when no impersonation session is active", async () => {
    cookieJar.get.mockReturnValue(undefined);

    await endPlatformImpersonation();

    expect(prismaMock.impersonationSession.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.impersonationSession.updateMany).not.toHaveBeenCalled();
    expect(cookieJar.delete).toHaveBeenCalled();
    expect(recordPlatformAudit).toHaveBeenCalledWith({
      adminUserId: "admin-1",
      action: "platform.impersonation.end",
      entityType: "impersonation_session",
      entityId: undefined,
      metadata: undefined,
    });
  });
});
