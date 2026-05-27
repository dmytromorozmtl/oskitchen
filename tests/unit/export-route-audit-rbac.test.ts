import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.hoisted(() => vi.fn());
const hasSuperAdminRoleRow = vi.hoisted(() => vi.fn());
const requireExportActor = vi.hoisted(() => vi.fn());
const buildExportCsv = vi.hoisted(() => vi.fn());
const recordExportJob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser },
  }),
}));

vi.mock("@/lib/platform-super-bypass", () => ({
  hasSuperAdminRoleRow,
}));

vi.mock("@/lib/import-export/require-export-actor", () => ({
  requireExportActor,
}));

vi.mock("@/services/import-export/export-service", () => ({
  buildExportCsv,
  recordExportJob: recordExportJob.mockResolvedValue(undefined),
}));

vi.mock("@/lib/import-export/streaming-csv-export", () => ({
  streamExportMeta: vi.fn().mockReturnValue(null),
  createStreamingCsvExport: vi.fn(),
}));

import { GET } from "@/app/api/export/route";

const allowedActor = {
  sessionUserId: "owner-1",
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: null,
  email: "owner@example.com",
  granted: new Set(["audit.export"]),
};

describe("export route audit_logs RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "workspace.moroz@gmail.com" } },
    });
    buildExportCsv.mockResolvedValue({
      filename: "kitchenos-audit-logs.csv",
      body: "id\n1\n",
      rowCount: 1,
    });
  });

  it("denies audit_logs export when bootstrap email lacks SUPER_ADMIN role row", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(false);

    const response = await GET(
      new Request("http://localhost/api/export?type=audit_logs"),
    );

    expect(response.status).toBe(403);
    expect(hasSuperAdminRoleRow).toHaveBeenCalledWith("user-1");
    expect(requireExportActor).not.toHaveBeenCalled();
    expect(buildExportCsv).not.toHaveBeenCalled();
  });

  it("allows audit_logs export when SUPER_ADMIN role row exists and audit.export granted", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(true);
    requireExportActor.mockResolvedValue({ ok: true, actor: allowedActor });

    const response = await GET(
      new Request("http://localhost/api/export?type=audit_logs"),
    );

    expect(response.status).toBe(200);
    expect(requireExportActor).toHaveBeenCalledWith({
      exportType: "audit_logs",
      operation: "export:audit_logs",
    });
    expect(buildExportCsv).toHaveBeenCalledWith("owner-1", "audit_logs", {
      isSuperAdmin: true,
    });
  });

  it("denies audit_logs export when SUPER_ADMIN role exists but audit.export denied", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(true);
    requireExportActor.mockResolvedValue({ ok: false, error: "Forbidden" });

    const response = await GET(
      new Request("http://localhost/api/export?type=audit_logs"),
    );

    expect(response.status).toBe(403);
    expect(buildExportCsv).not.toHaveBeenCalled();
  });
});
