import { beforeEach, describe, expect, it, vi } from "vitest";

const requireReportReadActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/reports/require-report-read-actor", () => ({
  requireReportReadActor,
}));

import { requireReportGeneratorPageAccess } from "@/lib/reports/require-report-generator-page";

const ownerActor = {
  sessionUserId: "user-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: null,
  email: "owner@example.com",
  granted: new Set<string>(),
};

describe("requireReportGeneratorPageAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns deny card when report read actor fails", async () => {
    requireReportReadActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to view financial reports.",
    });

    const access = await requireReportGeneratorPageAccess("revenue_report");
    expect(access.ok).toBe(false);
    if (!access.ok) {
      expect(access.requiredPermission).toBe("reports.read.financial");
    }
    expect(requireReportReadActor).toHaveBeenCalledWith("reports.read.financial", {
      operation: "reports.generator.view",
      reportKey: "revenue_report",
    });
  });

  it("allows operational report when actor gate passes", async () => {
    requireReportReadActor.mockResolvedValue({
      ok: true,
      actor: ownerActor,
      scope: { isOwner: true, userId: "owner-1" },
    });

    const access = await requireReportGeneratorPageAccess("orders_report");
    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.definition.key).toBe("orders_report");
      expect(access.definition.requiredPermission).toBe("reports.read.operations");
    }
  });
});
