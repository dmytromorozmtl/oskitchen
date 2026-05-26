import { beforeEach, describe, expect, it, vi } from "vitest";

const createTaskMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
  platformUserRole: {
    findMany: vi.fn(),
  },
  productionIncident: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  productionIncidentEvent: {
    create: vi.fn(),
  },
  kitchenTask: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  kitchenTaskEvent: {
    create: vi.fn(),
  },
  workspace: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/tasks/task-service", () => ({
  createTask: createTaskMock,
}));

import {
  handleProductionIncidentRemediationTaskStatusChange,
  reconcileProductionIncidentRemediationTasks,
  syncProductionIncidentRemediationTasksForIncident,
} from "@/services/incidents/production-incident-remediation-task-service";

describe("production incident remediation task service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    );
    prismaMock.workspace.findFirst.mockResolvedValue(null);
    prismaMock.productionIncident.update.mockResolvedValue({});
    prismaMock.productionIncidentEvent.create.mockResolvedValue({});
    prismaMock.kitchenTask.update.mockResolvedValue({});
    prismaMock.kitchenTaskEvent.create.mockResolvedValue({});
    createTaskMock.mockResolvedValue("task-created");
  });

  it("creates an urgent reassignment task for the incident assignee queue", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.platformUserRole.findMany.mockResolvedValue([
      { userId: "fallback-1" },
    ]);
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-1",
        title: "DoorDash sync follow-up",
        source: "critical_cron",
        href: "/platform/incidents",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationControlStatus: "REASSIGNMENT_REQUESTED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Current owner cannot complete the partner outreach.",
        remediationDueAt: new Date("2026-05-27T23:59:59.999Z"),
        remediationOwnerId: "owner-1",
        assignedToId: "manager-1",
      },
    ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([]);

    const result = await syncProductionIncidentRemediationTasksForIncident("incident-1", now);

    expect(result).toEqual({
      scanned: 1,
      created: 1,
      updated: 0,
      completed: 0,
    });
    expect(createTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "manager-1",
        title: "Reassign remediation owner: DoorDash sync follow-up",
        priority: "URGENT",
        dueAt: now,
        sourceId: "incident-1",
      }),
    );
  });

  it("retargets an existing active follow-up task when queue ownership changes", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.platformUserRole.findMany.mockResolvedValue([
      { userId: "fallback-1" },
    ]);
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-2",
        title: "Webhook ownership gap",
        source: "critical_cron",
        href: "/platform/incidents",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "dependency",
        remediationControlStatus: "REASSIGNMENT_REQUESTED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Needs a different integration owner.",
        remediationDueAt: new Date("2026-05-28T23:59:59.999Z"),
        remediationOwnerId: "owner-2",
        assignedToId: "manager-2",
      },
    ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([
      {
        id: "task-1",
        userId: "fallback-1",
        title: "Reassign remediation owner: old title",
        description: "old description",
        dueAt: new Date("2026-05-24T12:00:00.000Z"),
        priority: "HIGH",
        status: "OPEN",
        createdAt: new Date("2026-05-24T12:00:00.000Z"),
        metadataJson: {
          kind: "production_incident_remediation",
          taskKind: "reassignment",
          incidentId: "incident-2",
        },
      },
    ]);

    const result = await syncProductionIncidentRemediationTasksForIncident("incident-2", now);

    expect(result).toEqual({
      scanned: 1,
      created: 0,
      updated: 1,
      completed: 0,
    });
    expect(prismaMock.kitchenTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({
          userId: "manager-2",
          workspaceId: null,
          title: "Reassign remediation owner: Webhook ownership gap",
          priority: "URGENT",
          dueAt: now,
        }),
      }),
    );
    expect(prismaMock.kitchenTaskEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          taskId: "task-1",
          eventType: "UPDATED",
        }),
      }),
    );
  });

  it("reconciles overdue owner-engaged tasks and closes stale automation tasks", async () => {
    const now = new Date("2026-05-25T18:00:00.000Z");
    prismaMock.platformUserRole.findMany.mockResolvedValue([
      { userId: "fallback-1" },
    ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([
      {
        id: "task-stale",
        userId: "manager-1",
        title: "Reassign remediation owner: Old incident",
        description: "old description",
        dueAt: new Date("2026-05-24T12:00:00.000Z"),
        priority: "URGENT",
        status: "OPEN",
        createdAt: new Date("2026-05-24T12:00:00.000Z"),
        metadataJson: {
          kind: "production_incident_remediation",
          taskKind: "reassignment",
          incidentId: "incident-missing",
        },
      },
    ]);
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-owner",
        title: "Startup follow-up",
        source: "startup_readiness",
        href: "/dashboard/system-health",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "configuration",
        remediationControlStatus: "OWNER_ENGAGED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Owner confirmed fix rollout but missed the target window.",
        remediationDueAt: new Date("2026-05-24T12:00:00.000Z"),
        remediationOwnerId: "owner-1",
        assignedToId: "manager-1",
      },
    ]);

    const result = await reconcileProductionIncidentRemediationTasks(now);

    expect(result).toEqual({
      scanned: 1,
      created: 1,
      updated: 0,
      completed: 1,
    });
    expect(createTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        title: "Overdue remediation follow-up: Startup follow-up",
        priority: "HIGH",
        dueAt: new Date("2026-05-24T12:00:00.000Z"),
        sourceId: "incident-owner",
      }),
    );
    expect(prismaMock.kitchenTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-stale" },
        data: expect.objectContaining({
          status: "DONE",
          completedAt: now,
        }),
      }),
    );
  });

  it("closes reassignment requested control when a completed follow-up task proves owner changed", async () => {
    prismaMock.kitchenTask.findUnique.mockResolvedValue({
      id: "task-bridge-1",
      sourceId: "incident-bridge-1",
      sourceType: "PRODUCTION",
      sourceLabel: "Production incident remediation",
      metadataJson: {
        kind: "production_incident_remediation",
        taskKind: "reassignment",
        incidentId: "incident-bridge-1",
        requestedFromUserId: "owner-old",
      },
    });
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-bridge-1",
      reviewStatus: "IN_REMEDIATION",
      remediationControlStatus: "REASSIGNMENT_REQUESTED",
      remediationOwnerId: "owner-new",
    });
    prismaMock.platformUserRole.findMany.mockResolvedValue([]);
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-bridge-1",
        title: "Partner escalation handoff",
        source: "critical_cron",
        href: "/platform/incidents",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "operator_error",
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        remediationDueAt: new Date("2026-05-29T12:00:00.000Z"),
        remediationOwnerId: "owner-new",
        assignedToId: "manager-1",
      },
    ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([
      {
        id: "task-bridge-1",
        userId: "manager-1",
        title: "Reassign remediation owner: Partner escalation handoff",
        description: "queue follow-up",
        dueAt: new Date("2026-05-25T18:00:00.000Z"),
        priority: "URGENT",
        status: "DONE",
        createdAt: new Date("2026-05-25T17:50:00.000Z"),
        metadataJson: {
          kind: "production_incident_remediation",
          taskKind: "reassignment",
          incidentId: "incident-bridge-1",
          requestedFromUserId: "owner-old",
        },
      },
    ]);

    await handleProductionIncidentRemediationTaskStatusChange({
      taskId: "task-bridge-1",
      to: "DONE",
      actorUserId: "platform-user-1",
    });

    expect(prismaMock.productionIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "incident-bridge-1" },
        data: expect.objectContaining({
          remediationControlStatus: "TRACKING",
          remediationControlSummary: null,
          remediationControlUpdatedByUserId: "platform-user-1",
        }),
      }),
    );
    expect(prismaMock.productionIncidentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          incidentId: "incident-bridge-1",
          eventType: "REMEDIATION_CONTROL_UPDATED",
        }),
      }),
    );
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it("recreates owner follow-up task when it is completed without incident-side remediation progress", async () => {
    const overdueDueAt = new Date("2026-05-24T12:00:00.000Z");
    prismaMock.kitchenTask.findUnique.mockResolvedValue({
      id: "task-bridge-2",
      sourceId: "incident-bridge-2",
      sourceType: "PRODUCTION",
      sourceLabel: "Production incident remediation",
      metadataJson: {
        kind: "production_incident_remediation",
        taskKind: "owner_follow_up",
        incidentId: "incident-bridge-2",
        remediationOwnerId: "owner-1",
      },
    });
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-bridge-2",
      reviewStatus: "IN_REMEDIATION",
      remediationControlStatus: "OWNER_ENGAGED",
      remediationOwnerId: "owner-1",
    });
    prismaMock.platformUserRole.findMany.mockResolvedValue([]);
    prismaMock.productionIncident.findMany.mockResolvedValue([
      {
        id: "incident-bridge-2",
        title: "Startup follow-up",
        source: "startup_readiness",
        href: "/dashboard/system-health",
        reviewStatus: "IN_REMEDIATION",
        rootCauseCategory: "configuration",
        remediationControlStatus: "OWNER_ENGAGED",
        remediationSnoozedUntil: null,
        remediationControlSummary: "Owner still working on remediation.",
        remediationDueAt: overdueDueAt,
        remediationOwnerId: "owner-1",
        assignedToId: "manager-1",
      },
    ]);
    prismaMock.kitchenTask.findMany.mockResolvedValue([
      {
        id: "task-bridge-2",
        userId: "owner-1",
        title: "Overdue remediation follow-up: Startup follow-up",
        description: "owner follow-up",
        dueAt: overdueDueAt,
        priority: "HIGH",
        status: "DONE",
        createdAt: new Date("2026-05-25T17:50:00.000Z"),
        metadataJson: {
          kind: "production_incident_remediation",
          taskKind: "owner_follow_up",
          incidentId: "incident-bridge-2",
          remediationOwnerId: "owner-1",
        },
      },
    ]);

    await handleProductionIncidentRemediationTaskStatusChange({
      taskId: "task-bridge-2",
      to: "DONE",
      actorUserId: "platform-user-1",
    });

    expect(prismaMock.productionIncident.update).not.toHaveBeenCalled();
    expect(createTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        title: "Overdue remediation follow-up: Startup follow-up",
        priority: "HIGH",
        sourceId: "incident-bridge-2",
      }),
    );
  });
});
