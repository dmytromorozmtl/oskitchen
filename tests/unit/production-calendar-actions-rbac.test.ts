import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createProductionPlanTask = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/production/production-calendar-service", () => ({
  createProductionPlanTask,
  updateProductionPlanTaskDate: vi.fn(),
}));

import { createPlanTaskAction } from "@/actions/production-calendar";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "VIEWER" as const,
  email: "viewer@example.com",
  granted: new Set<string>(),
};

describe("production calendar actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    createProductionPlanTask.mockResolvedValue(undefined);
  });

  it("denies createPlanTaskAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("title", "Prep batch");
    formData.set("planDate", "2026-06-01");

    await createPlanTaskAction(formData);

    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "production_calendar.permission_denied",
        metadata: expect.objectContaining({
          operation: "production_calendar.create_task",
          requiredPermission: "production.manage",
        }),
      }),
    );
    expect(createProductionPlanTask).not.toHaveBeenCalled();
  });

  it("allows create when production.manage passes", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("title", "Prep batch");
    formData.set("planDate", "2026-06-01");

    await createPlanTaskAction(formData);

    expect(createProductionPlanTask).toHaveBeenCalled();
  });
});
