import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireExportActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/import-export/require-export-actor", () => ({
  requireExportActor,
}));

import { canExportReports, requireReportExportActor } from "@/lib/reports/report-export-access";

describe("report export access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies line-cook staff report export", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "cook-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };

    expect(canExportReports(actor)).toBe(false);
  });

  it("allows manager staff report export", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const actor = {
      sessionUserId: "mgr-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MANAGER" as const,
      email: "manager@example.com",
      granted,
    };

    expect(canExportReports(actor)).toBe(true);
  });

  it("delegates server export gate to requireExportActor", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const actor = {
      sessionUserId: "mgr-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MANAGER" as const,
      email: "manager@example.com",
      granted,
    };
    requireExportActor.mockResolvedValue({ ok: true, actor });

    const access = await requireReportExportActor({ reportKey: "revenue_report" });

    expect(access.ok).toBe(true);
    expect(requireExportActor).toHaveBeenCalledWith({
      exportType: "reports",
      operation: "report:revenue_report",
      metadata: { reportKey: "revenue_report" },
    });
  });
});
