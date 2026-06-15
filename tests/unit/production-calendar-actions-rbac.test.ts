import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));
const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createProductionPlanTask = vi.hoisted(() => vi.fn());
const updateProductionPlanTaskDate = vi.hoisted(() => vi.fn());
const updateProductionPlanTaskStatus = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));
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
  updateProductionPlanTaskDate,
  updateProductionPlanTaskStatus,
}));

import {
  createPlanTaskAction,
  movePlanTaskAction,
  updatePlanTaskStatusAction,
} from "@/actions/production-calendar";

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
    updateProductionPlanTaskDate.mockResolvedValue(undefined);
    updateProductionPlanTaskStatus.mockResolvedValue(undefined);
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

    await expect(createPlanTaskAction(formData)).rejects.toThrow("REDIRECT:");
    expect(redirect).toHaveBeenCalled();

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

  it("denies movePlanTaskAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("taskId", "task-1");
    formData.set("planDate", "2026-06-02");

    await expect(movePlanTaskAction(formData)).rejects.toThrow("REDIRECT:");
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "production_calendar.move_task",
          requiredPermission: "production.manage",
        }),
      }),
    );
    expect(updateProductionPlanTaskDate).not.toHaveBeenCalled();
  });

  it("allows move when production.manage passes", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("taskId", "task-1");
    formData.set("planDate", "2026-06-02");

    await movePlanTaskAction(formData);

    expect(updateProductionPlanTaskDate).toHaveBeenCalledWith(
      "task-1",
      "owner-1",
      expect.any(Date),
    );
  });

  it("denies updatePlanTaskStatusAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("taskId", "task-1");
    formData.set("status", "IN_PROGRESS");

    await expect(updatePlanTaskStatusAction(formData)).rejects.toThrow("REDIRECT:");
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "production_calendar.update_task_status",
          requiredPermission: "production.manage",
        }),
      }),
    );
    expect(updateProductionPlanTaskStatus).not.toHaveBeenCalled();
  });

  it("allows status update when production.manage passes", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("taskId", "task-1");
    formData.set("status", "COMPLETED");

    await updatePlanTaskStatusAction(formData);

    expect(updateProductionPlanTaskStatus).toHaveBeenCalledWith(
      "task-1",
      "owner-1",
      "COMPLETED",
    );
  });
});
