import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const logReportPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/services/reports/report-permission-audit", () => ({
  logReportPermissionDenied,
}));

import { requireReportReadActor } from "@/lib/reports/require-report-read-actor";

describe("requireReportReadActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies line cook financial reports and audits", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const access = await requireReportReadActor("reports.read.financial", {
      operation: "reports.financial_hub",
    });

    expect(access.ok).toBe(false);
    expect(logReportPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "reports.read.financial",
        operation: "reports.financial_hub",
      }),
    );
  });

  it("allows manager financial reports via canonical grants", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const actor = {
      sessionUserId: "user-2",
      dataUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MANAGER" as const,
      email: "mgr@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const access = await requireReportReadActor("reports.read.financial");

    expect(access.ok).toBe(true);
    expect(logReportPermissionDenied).not.toHaveBeenCalled();
  });

  it("allows line cook operational reports via canonical grants", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-3",
      dataUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const access = await requireReportReadActor("reports.read.operations");

    expect(access.ok).toBe(true);
  });
});
