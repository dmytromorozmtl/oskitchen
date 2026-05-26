import { beforeEach, describe, expect, it, vi } from "vitest";

const createTaskMock = vi.hoisted(() => vi.fn());
const loadProductionIncidentRollupMock = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({
  incidents: [] as Array<Record<string, unknown>>,
  tasks: [] as Array<Record<string, unknown>>,
  incidentEvents: [] as Array<Record<string, unknown>>,
  taskEvents: [] as Array<Record<string, unknown>>,
  platformRoleUserIds: [] as string[],
}));

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
  platformUserRole: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  productionIncident: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  productionIncidentEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  kitchenTask: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  kitchenTaskEvent: {
    create: vi.fn(),
  },
  workspace: {
    findFirst: vi.fn(),
  },
}));

const USERS: Record<string, { fullName: string; email: string }> = {
  "manager-1": { fullName: "Platform Lead", email: "lead@example.com" },
  "owner-old": { fullName: "Ops Owner Old", email: "old@example.com" },
  "owner-new": { fullName: "Ops Owner New", email: "new@example.com" },
  "platform-user-1": { fullName: "Platform Admin", email: "platform@example.com" },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/tasks/task-service", () => ({
  createTask: createTaskMock,
}));
vi.mock("@/services/incidents/production-incident-rollup-service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/services/incidents/production-incident-rollup-service")>();
  return {
    ...actual,
    loadProductionIncidentRollup: loadProductionIncidentRollupMock,
  };
});

import { loadProductionIncidentExecutiveSnapshot } from "@/services/incidents/production-incident-reporting-service";
import {
  syncProductionIncidentRemediationTasksForIncident,
} from "@/services/incidents/production-incident-remediation-task-service";
import {
  updateProductionIncidentRemediationControl,
  updateProductionIncidentReview,
} from "@/services/incidents/production-incident-rollup-service";
import { updateProductionIncidentRemediationTaskStatusForPlatform } from "@/services/incidents/production-incident-platform-task-service";

function resetState() {
  state.incidents = [
    {
      id: "incident-loop-1",
      title: "Partner escalation handoff",
      severity: "medium",
      workflowStatus: "ACKNOWLEDGED",
      reviewStatus: "IN_REMEDIATION",
      rootCauseCategory: "operator_error",
      remediationControlStatus: "REASSIGNMENT_REQUESTED",
      remediationSnoozedUntil: null,
      remediationControlSummary: "Current owner cannot complete vendor follow-up.",
      remediationControlUpdatedAt: null,
      remediationControlUpdatedByUserId: null,
      reviewSummary: null,
      source: "critical_cron",
      sourceKey: "critical-cron:partner-sync:failed:2026-05-24T08:00:00.000Z",
      href: "/platform/incidents",
      ownerLabel: "Platform operations",
      assignedToId: "manager-1",
      remediationOwnerId: "owner-old",
      remediationDueAt: new Date("2026-05-29T12:00:00.000Z"),
      firstSeenAt: new Date("2026-05-24T08:00:00.000Z"),
      lastSeenAt: new Date("2026-05-25T17:40:00.000Z"),
      acknowledgedAt: new Date("2026-05-24T08:20:00.000Z"),
      resolvedAt: null,
      metadataJson: { slug: "partner-sync" },
      assignedTo: { id: "manager-1", ...USERS["manager-1"] },
      remediationOwner: { id: "owner-old", ...USERS["owner-old"] },
      acknowledgedBy: { id: "manager-1", ...USERS["manager-1"] },
      remediationControlUpdatedBy: null,
      reviewedBy: null,
      autoResolved: false,
    },
  ];
  state.tasks = [];
  state.incidentEvents = [];
  state.taskEvents = [];
  state.platformRoleUserIds = ["owner-old", "owner-new", "manager-1", "platform-user-1"];
}

function currentIncident() {
  return state.incidents[0] as Record<string, unknown>;
}

function taskWithRelations(task: Record<string, unknown>) {
  const ownerId = task.userId as string;
  return {
    ...task,
    userProfile: USERS[ownerId] ?? null,
  };
}

describe("production incident remediation loop integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();

    prismaMock.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    );
    prismaMock.workspace.findFirst.mockResolvedValue(null);

    loadProductionIncidentRollupMock.mockResolvedValue({
      summary: {
        open: 1,
        critical: 0,
        high: 0,
        startupReadiness: 0,
        criticalCron: 1,
        webhookRecovery: 0,
      },
      items: [],
      timeline: [],
    });

    prismaMock.platformUserRole.findMany.mockImplementation(async () =>
      state.platformRoleUserIds.map((userId) => ({
        userId,
        role: "PLATFORM_ADMIN",
        user: USERS[userId],
      })),
    );
    prismaMock.platformUserRole.findFirst.mockImplementation(async ({ where }: any) => {
      const userId = where?.userId as string | undefined;
      return userId && state.platformRoleUserIds.includes(userId) ? { id: `role:${userId}` } : null;
    });

    prismaMock.productionIncident.findMany.mockImplementation(async ({ where }: any) => {
      const rows = state.incidents.filter((incident) => {
        if (where?.id?.in) return where.id.in.includes(incident.id);
        if (where?.workflowStatus?.not === "RESOLVED") return incident.workflowStatus !== "RESOLVED";
        return true;
      });
      return rows.map((incident) => ({
        ...incident,
        assignedTo: incident.assignedTo
          ? { fullName: (incident.assignedTo as any).fullName, email: (incident.assignedTo as any).email }
          : null,
        remediationOwner: incident.remediationOwner
          ? {
              fullName: (incident.remediationOwner as any).fullName,
              email: (incident.remediationOwner as any).email,
            }
          : null,
      }));
    });
    prismaMock.productionIncident.findUnique.mockImplementation(async ({ where }: any) => {
      const incident = state.incidents.find((row) => row.id === where?.id);
      return incident
        ? {
            ...incident,
            remediationOwner: incident.remediationOwner
              ? {
                  fullName: (incident.remediationOwner as any).fullName,
                  email: (incident.remediationOwner as any).email,
                }
              : null,
          }
        : null;
    });
    prismaMock.productionIncident.update.mockImplementation(async ({ where, data }: any) => {
      const incident = state.incidents.find((row) => row.id === where?.id);
      if (!incident) return {};
      Object.assign(incident, data);
      if ("remediationOwnerId" in data) {
        incident.remediationOwner =
          data.remediationOwnerId && USERS[data.remediationOwnerId]
            ? { id: data.remediationOwnerId, ...USERS[data.remediationOwnerId] }
            : null;
      }
      if ("remediationControlUpdatedByUserId" in data) {
        incident.remediationControlUpdatedBy =
          data.remediationControlUpdatedByUserId && USERS[data.remediationControlUpdatedByUserId]
            ? {
                id: data.remediationControlUpdatedByUserId,
                ...USERS[data.remediationControlUpdatedByUserId],
              }
            : null;
      }
      return incident;
    });
    prismaMock.productionIncidentEvent.create.mockImplementation(async ({ data }: any) => {
      state.incidentEvents.push(data);
      return data;
    });
    prismaMock.productionIncidentEvent.findMany.mockResolvedValue([]);

    prismaMock.kitchenTask.findMany.mockImplementation(async ({ where }: any) => {
      let rows = state.tasks;
      if (where?.sourceId?.in) {
        rows = rows.filter(
          (task) =>
            where.sourceId.in.includes(task.sourceId) &&
            !["DONE", "CANCELLED"].includes(task.status as string),
        );
      } else if (typeof where?.sourceId === "string") {
        rows = rows.filter((task) => task.sourceId === where.sourceId);
      }
      if (where?.status?.notIn) {
        rows = rows.filter((task) => !where.status.notIn.includes(task.status));
      }
      return rows.map(taskWithRelations);
    });
    prismaMock.kitchenTask.findUnique.mockImplementation(async ({ where }: any) => {
      const task = state.tasks.find((row) => row.id === where?.id);
      return task ? { ...task } : null;
    });
    prismaMock.kitchenTask.findFirst.mockImplementation(async ({ where }: any) => {
      const task = state.tasks.find(
        (row) =>
          row.id === where?.id &&
          row.sourceType === where?.sourceType &&
          row.sourceLabel === where?.sourceLabel,
      );
      return task ? { ...task } : null;
    });
    prismaMock.kitchenTask.update.mockImplementation(async ({ where, data }: any) => {
      const task = state.tasks.find((row) => row.id === where?.id);
      if (!task) return {};
      Object.assign(task, data);
      return task;
    });
    prismaMock.kitchenTaskEvent.create.mockImplementation(async ({ data }: any) => {
      state.taskEvents.push(data);
      return data;
    });

    createTaskMock.mockImplementation(async (input: any) => {
      const id = `task-${state.tasks.length + 1}`;
      state.tasks.push({
        id,
        userId: input.userId,
        title: input.title,
        description: input.description ?? null,
        dueAt: input.dueAt ?? null,
        priority: input.priority,
        status: input.status ?? "OPEN",
        createdAt: new Date("2026-05-25T17:50:00.000Z"),
        startedAt: null,
        completedAt: null,
        actualMinutes: null,
        estimatedMinutes: null,
        blockedReason: null,
        checklistJson: null,
        sourceType: input.sourceType,
        sourceId: input.sourceId ?? null,
        sourceLabel: input.sourceLabel ?? null,
        metadataJson: input.metadata ?? null,
      });
      return id;
    });
  });

  it("keeps the reassignment loop consistent across task sync, owner change, task completion, and reporting", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");

    const createResult = await syncProductionIncidentRemediationTasksForIncident("incident-loop-1", now);

    expect(createResult).toEqual({
      scanned: 1,
      created: 1,
      updated: 0,
      completed: 0,
    });
    expect(state.tasks).toHaveLength(1);
    expect((state.tasks[0].metadataJson as any).requestedFromUserId).toBe("owner-old");

    await expect(
      updateProductionIncidentReview({
        incidentId: "incident-loop-1",
        actorUserId: "platform-user-1",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationOwnerId: "owner-new",
        remediationDueAt: new Date("2026-05-29T12:00:00.000Z"),
        reviewSummary: null,
      }),
    ).resolves.toEqual({ ok: true });

    expect((currentIncident().remediationOwnerId as string)).toBe("owner-new");
    expect((currentIncident().remediationControlStatus as string)).toBe("REASSIGNMENT_REQUESTED");
    expect((state.tasks[0].metadataJson as any).requestedFromUserId).toBe("owner-old");

    const snapshotBeforeCompletion = await loadProductionIncidentExecutiveSnapshot(now);

    expect(snapshotBeforeCompletion.report.summary).toEqual(
      expect.objectContaining({
        inRemediation: 1,
        remediationReassignmentRequested: 1,
        remediationTaskBacked: 1,
        remediationTaskMissing: 0,
        remediationReassignmentTasks: 1,
      }),
    );
    expect(snapshotBeforeCompletion.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        id: "incident-loop-1",
        remediationControlStatus: "REASSIGNMENT_REQUESTED",
        remediationTaskKind: "reassignment",
        remediationTaskStatus: "OPEN",
        remediationTaskMissing: false,
      }),
    );

    await expect(
      updateProductionIncidentRemediationTaskStatusForPlatform({
        taskId: state.tasks[0].id as string,
        to: "DONE",
        actorUserId: "platform-user-1",
        performedBy: USERS["platform-user-1"].email,
      }),
    ).resolves.toEqual({ ok: true });

    expect((currentIncident().remediationControlStatus as string)).toBe("TRACKING");
    expect(state.tasks.every((task) => task.status === "DONE")).toBe(true);
    expect(
      state.incidentEvents.some(
        (event) =>
          event.eventType === "REMEDIATION_CONTROL_UPDATED" &&
          (event.metadataJson as any)?.via === "task_completion",
      ),
    ).toBe(true);

    const snapshotAfterCompletion = await loadProductionIncidentExecutiveSnapshot(now);

    expect(snapshotAfterCompletion.report.summary).toEqual(
      expect.objectContaining({
        inRemediation: 1,
        remediationTracking: 1,
        remediationReassignmentRequested: 0,
        remediationTaskBacked: 0,
        remediationTaskMissing: 0,
        remediationReassignmentTasks: 0,
      }),
    );
    expect(snapshotAfterCompletion.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        id: "incident-loop-1",
        remediationControlStatus: "TRACKING",
        remediationTaskExpected: false,
        remediationTaskMissing: false,
        remediationTaskKind: null,
      }),
    );
  });

  it("recreates overdue owner-engaged follow-up tasks until remediation exits the overdue state, then cleans them up", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    const overdueDueAt = new Date("2026-05-24T12:00:00.000Z");

    await expect(
      updateProductionIncidentRemediationControl({
        incidentId: "incident-loop-1",
        actorUserId: "platform-user-1",
        remediationControlStatus: "OWNER_ENGAGED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Owner accepted the remediation plan.",
      }),
    ).resolves.toEqual({ ok: true });

    await expect(
      updateProductionIncidentReview({
        incidentId: "incident-loop-1",
        actorUserId: "platform-user-1",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationOwnerId: "owner-old",
        remediationDueAt: overdueDueAt,
        reviewSummary: null,
      }),
    ).resolves.toEqual({ ok: true });

    expect((currentIncident().remediationControlStatus as string)).toBe("OWNER_ENGAGED");
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]).toEqual(
      expect.objectContaining({
        title: "Overdue remediation follow-up: Partner escalation handoff",
        userId: "owner-old",
        status: "OPEN",
      }),
    );

    const snapshotBeforePrematureDone = await loadProductionIncidentExecutiveSnapshot(now);
    expect(snapshotBeforePrematureDone.report.summary).toEqual(
      expect.objectContaining({
        remediationOwnerEngaged: 1,
        remediationTaskBacked: 1,
        remediationOwnerFollowUpTasks: 1,
        remediationTaskMissing: 0,
      }),
    );
    expect(snapshotBeforePrematureDone.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        remediationControlStatus: "OWNER_ENGAGED",
        remediationTaskKind: "owner_follow_up",
        remediationTaskStatus: "OPEN",
      }),
    );

    await expect(
      updateProductionIncidentRemediationTaskStatusForPlatform({
        taskId: state.tasks[0].id as string,
        to: "DONE",
        actorUserId: "platform-user-1",
        performedBy: USERS["platform-user-1"].email,
      }),
    ).resolves.toEqual({ ok: true });

    expect(state.tasks).toHaveLength(2);
    expect(state.tasks.filter((task) => task.status === "OPEN")).toHaveLength(1);
    expect(state.tasks.filter((task) => task.status === "DONE")).toHaveLength(1);

    const snapshotAfterPrematureDone = await loadProductionIncidentExecutiveSnapshot(now);
    expect(snapshotAfterPrematureDone.report.summary).toEqual(
      expect.objectContaining({
        remediationOwnerEngaged: 1,
        remediationTaskBacked: 1,
        remediationOwnerFollowUpTasks: 1,
        remediationTaskMissing: 0,
      }),
    );
    expect(snapshotAfterPrematureDone.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        remediationControlStatus: "OWNER_ENGAGED",
        remediationTaskKind: "owner_follow_up",
        remediationTaskStatus: "OPEN",
      }),
    );

    await expect(
      updateProductionIncidentRemediationControl({
        incidentId: "incident-loop-1",
        actorUserId: "platform-user-1",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
      }),
    ).resolves.toEqual({ ok: true });

    expect((currentIncident().remediationControlStatus as string)).toBe("TRACKING");
    expect(state.tasks.filter((task) => task.status === "OPEN")).toHaveLength(0);

    const snapshotAfterCleanup = await loadProductionIncidentExecutiveSnapshot(now);
    expect(snapshotAfterCleanup.report.summary).toEqual(
      expect.objectContaining({
        remediationTracking: 1,
        remediationOwnerEngaged: 0,
        remediationTaskBacked: 0,
        remediationOwnerFollowUpTasks: 0,
        remediationTaskMissing: 0,
      }),
    );
    expect(snapshotAfterCleanup.report.remediationAttention[0]).toEqual(
      expect.objectContaining({
        remediationControlStatus: "TRACKING",
        remediationTaskExpected: false,
        remediationTaskKind: null,
        remediationTaskMissing: false,
      }),
    );
  });
});
