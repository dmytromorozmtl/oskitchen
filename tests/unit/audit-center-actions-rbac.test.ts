import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const hasSuperAdminRoleRow = vi.hoisted(() => vi.fn());
const exportAuditLogsSync = vi.hoisted(() => vi.fn());
const auditRetentionUpsert = vi.hoisted(() => vi.fn());
const userProfileFindUnique = vi.hoisted(() => vi.fn());
const workspaceFindMany = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/platform-super-bypass", () => ({
  hasSuperAdminRoleRow,
}));

vi.mock("@/services/audit/audit-export-service", () => ({
  exportAuditLogsSync,
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: { findUnique: userProfileFindUnique },
    workspace: { findMany: workspaceFindMany },
    auditRetentionPolicy: { upsert: auditRetentionUpsert },
  },
}));

import { runAuditExportAction, upsertAuditRetentionAction } from "@/actions/audit-center";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

const allowedActor = {
  sessionUserId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: null,
  email: "owner@example.com",
  granted: new Set(["audit.export", "workspace.settings"]),
};

function mockResolveScope() {
  requireTenantActor.mockResolvedValue({
    sessionUser: { id: "owner-1", email: "owner@example.com" },
    dataUserId: "owner-1",
    userId: "owner-1",
  });
  userProfileFindUnique.mockResolvedValue({ email: "owner@example.com", role: "owner" });
  hasSuperAdminRoleRow.mockResolvedValue(false);
  workspaceFindMany.mockResolvedValue([{ id: "ws-1" }]);
}

describe("audit center actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies runAuditExportAction without audit.export and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await runAuditExportAction({
      format: "CSV",
      filters: {},
    });

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("audit.export");
    expect(exportAuditLogsSync).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "audit_center.permission_denied",
        metadata: expect.objectContaining({
          operation: "audit_center.export",
          requiredPermission: "audit.export",
        }),
      }),
    );
  });

  it("allows runAuditExportAction when audit.export is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: allowedActor });
    mockResolveScope();
    exportAuditLogsSync.mockResolvedValue({
      ok: true,
      body: "id\n1\n",
      filename: "audit.csv",
      rowCount: 1,
    });

    const result = await runAuditExportAction({
      format: "CSV",
      filters: { workspaceId: "ws-1" },
    });

    expect(result).toEqual({
      ok: true,
      body: "id\n1\n",
      filename: "audit.csv",
      rowCount: 1,
    });
    expect(exportAuditLogsSync).toHaveBeenCalled();
  });

  it("denies upsertAuditRetentionAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("retentionDays", "365");

    await expect(upsertAuditRetentionAction(formData)).rejects.toThrow("forbidden");
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(auditRetentionUpsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "audit_center.permission_denied",
        metadata: expect.objectContaining({
          operation: "audit_center.retention_upsert",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });

  it("allows upsertAuditRetentionAction when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: allowedActor });
    mockResolveScope();
    auditRetentionUpsert.mockResolvedValue({});

    const formData = new FormData();
    formData.set("retentionDays", "180");

    await upsertAuditRetentionAction(formData);

    expect(auditRetentionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workspaceId: "ws-1" },
        create: expect.objectContaining({ retentionDays: 180 }),
      }),
    );
  });
});
