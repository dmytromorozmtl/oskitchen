import { beforeEach, describe, expect, it, vi } from "vitest";

const handleProductionIncidentRemediationTaskStatusChangeMock = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
  kitchenTask: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  kitchenTaskEvent: {
    create: vi.fn(),
  },
  productionIncident: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
vi.mock("@/services/incidents/production-incident-remediation-task-service", () => ({
  PRODUCTION_INCIDENT_REMEDIATION_TASK_SOURCE_LABEL: "Production incident remediation",
  parseProductionIncidentRemediationTaskMetadata: (metadataJson: unknown) => {
    if (!metadataJson || typeof metadataJson !== "object" || Array.isArray(metadataJson)) {
      return null;
    }
    const metadata = metadataJson as Record<string, unknown>;
    return metadata.kind === "production_incident_remediation" ? metadata : null;
  },
  handleProductionIncidentRemediationTaskStatusChange:
    handleProductionIncidentRemediationTaskStatusChangeMock,
}));

import {
  getProductionIncidentRemediationTaskForPlatform,
  updateProductionIncidentRemediationTaskStatusForPlatform,
} from "@/services/incidents/production-incident-platform-task-service";

describe("production incident platform task service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    );
    prismaMock.kitchenTask.update.mockResolvedValue({});
    prismaMock.kitchenTaskEvent.create.mockResolvedValue({});
    handleProductionIncidentRemediationTaskStatusChangeMock.mockResolvedValue(undefined);
  });

  it("loads a platform-safe remediation task detail with linked incident context", async () => {
    prismaMock.kitchenTask.findFirst.mockResolvedValue({
      id: "task-1",
      title: "Reassign remediation owner: Partner escalation handoff",
      description: "Follow up with the new owner assignment.",
      checklistJson: null,
      status: "OPEN",
      priority: "URGENT",
      dueAt: new Date("2026-05-25T18:00:00.000Z"),
      createdAt: new Date("2026-05-25T17:50:00.000Z"),
      startedAt: null,
      completedAt: null,
      actualMinutes: null,
      estimatedMinutes: null,
      blockedReason: null,
      sourceLabel: "Production incident remediation",
      sourceId: "incident-1",
      metadataJson: {
        kind: "production_incident_remediation",
        taskKind: "reassignment",
        incidentId: "incident-1",
      },
      userId: "platform-owner-1",
      userProfile: { id: "platform-owner-1", fullName: "Platform Lead", email: "lead@example.com" },
      comments: [],
      events: [
        {
          id: "event-1",
          eventType: "CREATED",
          performedBy: "ops@example.com",
          createdAt: new Date("2026-05-25T17:50:00.000Z"),
        },
      ],
    });
    prismaMock.productionIncident.findUnique.mockResolvedValue({
      id: "incident-1",
      title: "Partner escalation handoff",
      href: "/platform/incidents",
      workflowStatus: "ACKNOWLEDGED",
      reviewStatus: "IN_REMEDIATION",
      remediationControlStatus: "REASSIGNMENT_REQUESTED",
      remediationOwnerId: "owner-1",
      remediationDueAt: new Date("2026-05-29T12:00:00.000Z"),
      remediationOwner: { fullName: "Ops Owner", email: "ops@example.com" },
    });

    const task = await getProductionIncidentRemediationTaskForPlatform("task-1");

    expect(task).toEqual(
      expect.objectContaining({
        id: "task-1",
        ownerName: "Platform Lead",
        incident: expect.objectContaining({
          id: "incident-1",
          remediationControlStatus: "REASSIGNMENT_REQUESTED",
        }),
      }),
    );
  });

  it("does not load a non-remediation task through the platform surface", async () => {
    prismaMock.kitchenTask.findFirst.mockResolvedValue({
      id: "task-2",
      metadataJson: { kind: "manual_task" },
    });

    const task = await getProductionIncidentRemediationTaskForPlatform("task-2");

    expect(task).toBeNull();
    expect(prismaMock.productionIncident.findUnique).not.toHaveBeenCalled();
  });

  it("updates remediation task status and invokes the incident bridge", async () => {
    prismaMock.kitchenTask.findFirst.mockResolvedValue({
      id: "task-3",
      status: "OPEN",
      startedAt: null,
      completedAt: null,
      metadataJson: {
        kind: "production_incident_remediation",
        taskKind: "owner_follow_up",
        incidentId: "incident-3",
      },
    });

    const result = await updateProductionIncidentRemediationTaskStatusForPlatform({
      taskId: "task-3",
      to: "DONE",
      actorUserId: "platform-user-1",
      performedBy: "ops@example.com",
    });

    expect(result).toEqual({ ok: true });
    expect(prismaMock.kitchenTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-3" },
        data: expect.objectContaining({
          status: "DONE",
          completedById: "platform-user-1",
        }),
      }),
    );
    expect(prismaMock.kitchenTaskEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          taskId: "task-3",
          eventType: "COMPLETED",
        }),
      }),
    );
    expect(handleProductionIncidentRemediationTaskStatusChangeMock).toHaveBeenCalledWith({
      taskId: "task-3",
      to: "DONE",
      actorUserId: "platform-user-1",
    });
  });
});
