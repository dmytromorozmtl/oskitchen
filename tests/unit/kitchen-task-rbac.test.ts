import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createTask = vi.hoisted(() => vi.fn());
const updateTaskStatus = vi.hoisted(() => vi.fn());
const createFollowUpTask = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    staffMember: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock("@/services/tasks/task-service", () => ({
  createTask,
  updateTaskStatus,
  assignTask: vi.fn(),
  updatePriority: vi.fn(),
  rescheduleTask: vi.fn(),
  addComment: vi.fn(),
  toggleChecklist: vi.fn(),
  createFollowUpTask,
}));

import {
  createIntegrationFollowUpTask,
  createKitchenTaskAction,
  updateKitchenTaskStatusAction,
} from "@/actions/kitchen-task";

const TASK_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("kitchen task actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      userId: "owner-1",
    });
    createTask.mockResolvedValue(TASK_ID);
    updateTaskStatus.mockResolvedValue({});
    createFollowUpTask.mockResolvedValue(TASK_ID);
  });

  it("denies createKitchenTaskAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("title", "Prep station reset");
    formData.set("taskType", "PREP");

    const result = await createKitchenTaskAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createTask).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "kitchen_task.permission_denied",
        metadata: expect.objectContaining({
          operation: "kitchen_task.create",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies updateKitchenTaskStatusAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("id", TASK_ID);
    formData.set("status", "DONE");

    const result = await updateKitchenTaskStatusAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(updateTaskStatus).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "kitchen_task.update_status" }),
      }),
    );
  });

  it("denies createIntegrationFollowUpTask without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await createIntegrationFollowUpTask({
      title: "Route delay follow-up",
      source: "ROUTE",
    });

    expect(result).toEqual({ error: "Forbidden" });
    expect(createFollowUpTask).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "kitchen_task.integration_follow_up" }),
      }),
    );
  });

  it("allows createKitchenTaskAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("title", "Prep station reset");
    formData.set("description", "");
    formData.set("taskType", "PREP");
    formData.set("assignedToId", "");
    formData.set("dueAt", "");

    const result = await createKitchenTaskAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "owner-1", title: "Prep station reset" }),
    );
  });
});
