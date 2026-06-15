import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const hasSuperAdminRoleRow = vi.hoisted(() => vi.fn());
const exportAuditLogsSync = vi.hoisted(() => vi.fn());
const auditRetentionUpsert = vi.hoisted(() => vi.fn());
const auditRetentionFindUnique = vi.hoisted(() => vi.fn());
const userProfileFindUnique = vi.hoisted(() => vi.fn());
const workspaceFindMany = vi.hoisted(() => vi.fn());
const queryAuditLogs = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/audit/audit-query-service", () => ({
  queryAuditLogs,
  getAuditKpis: vi.fn(),
  getAuditLogById: vi.fn(),
  getAuditTimeline: vi.fn(),
  stripSensitiveDetailForViewer: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: { findUnique: userProfileFindUnique },
    workspace: { findMany: workspaceFindMany },
    auditRetentionPolicy: {
      upsert: auditRetentionUpsert,
      findUnique: auditRetentionFindUnique,
    },
  },
}));

import {
  getAuditRetentionForOwnerAction,
  loadMoreAuditLogsAction,
  runAuditExportAction,
  upsertAuditRetentionAction,
} from "@/actions/audit-center";

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
  granted: new Set(["audit.export", "workspace.settings", "reports.read.audit"]),
};

const staffAuditReader = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set(["reports.read.audit"]),
};

function grantAuditCenterPermissions(actor = allowedActor) {
  requireMutationPermission.mockImplementation(async (permission: string) => {
    const allowed = new Set(actor.granted);
    if (allowed.has(permission)) {
      return { ok: true, actor };
    }
    return {
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    };
  });
}

function mockResolveScope(sessionUserId = "owner-1", dataUserId = "owner-1") {
  requireTenantActor.mockResolvedValue({
    sessionUser: { id: sessionUserId, email: sessionUserId === "owner-1" ? "owner@example.com" : "cook@example.com" },
    dataUserId,
    userId: dataUserId,
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

  it("denies loadMoreAuditLogsAction without reports.read.audit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await loadMoreAuditLogsAction({}, "cursor-1");

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.audit");
    expect(queryAuditLogs).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "audit_center.view",
          requiredPermission: "reports.read.audit",
        }),
      }),
    );
  });

  it("scopes workspace lookup to owner dataUserId for staff audit readers", async () => {
    grantAuditCenterPermissions(staffAuditReader);
    mockResolveScope("staff-1", "owner-1");
    queryAuditLogs.mockResolvedValue({ rows: [], nextCursor: null });

    await loadMoreAuditLogsAction({}, "cursor-1");

    expect(workspaceFindMany).toHaveBeenCalledWith({
      where: { ownerUserId: "owner-1" },
      select: { id: true },
    });
    expect(queryAuditLogs).toHaveBeenCalled();
  });

  it("allows runAuditExportAction when audit.export is granted", async () => {
    grantAuditCenterPermissions();
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

  it("denies getAuditRetentionForOwnerAction without workspace.settings", async () => {
    requireMutationPermission.mockImplementation(async (permission: string) => {
      if (permission === "reports.read.audit") {
        return { ok: true, actor: allowedActor };
      }
      return {
        ok: false,
        error: "You do not have permission to perform this action.",
        actor: deniedActor,
      };
    });

    const result = await getAuditRetentionForOwnerAction();

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(auditRetentionFindUnique).not.toHaveBeenCalled();
  });

  it("allows upsertAuditRetentionAction when workspace.settings is granted", async () => {
    grantAuditCenterPermissions();
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
