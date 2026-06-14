import {
  KitchenTaskEventType,
  KitchenTaskPriority,
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { createTask } from "@/services/tasks/task-service";

const TASK_SOURCE_LABEL = "Production incident remediation";
const TASK_METADATA_KIND = "production_incident_remediation";
const OWNER_ENGAGED_TASK_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const PRODUCTION_INCIDENT_REMEDIATION_TASK_SOURCE_LABEL = TASK_SOURCE_LABEL;

type IncidentRow = {
  id: string;
  title: string;
  source: string;
  href: string;
  reviewStatus: string;
  rootCauseCategory: string | null;
  remediationControlStatus: string;
  remediationSnoozedUntil: Date | null;
  remediationControlSummary: string | null;
  remediationDueAt: Date | null;
  remediationOwnerId: string | null;
  assignedToId: string | null;
};

type TaskRow = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  priority: import("@prisma/client").KitchenTaskPriority;
  status: import("@prisma/client").KitchenTaskStatus;
  createdAt: Date;
  metadataJson: unknown;
};

type TaskKind = "reassignment" | "owner_follow_up";

export type ProductionIncidentRemediationTaskKind = TaskKind;

export type ProductionIncidentRemediationTaskSnapshot = {
  taskId: string;
  taskTitle: string;
  taskStatus: import("@prisma/client").KitchenTaskStatus;
  taskPriority: import("@prisma/client").KitchenTaskPriority;
  taskKind: TaskKind;
  taskDueAt: string | null;
  taskOwnerUserId: string;
  taskOwnerName: string | null;
  taskOwnerEmail: string | null;
  taskHref: string;
  taskCreatedAt: string;
};

type DesiredTaskSpec = {
  kind: TaskKind;
  userId: string;
  title: string;
  description: string;
  dueAt: Date | null;
  priority: import("@prisma/client").KitchenTaskPriority;
  metadataJson: Prisma.InputJsonValue;
};

export type ProductionIncidentRemediationTaskSyncResult = {
  scanned: number;
  created: number;
  updated: number;
  completed: number;
};

type RemediationTaskBridgeRow = {
  id: string;
  sourceId: string | null;
  sourceType: import("@prisma/client").KitchenTaskSource;
  sourceLabel: string | null;
  metadataJson: unknown;
};

type RemediationIncidentBridgeRow = {
  id: string;
  reviewStatus: string;
  remediationControlStatus: string;
  remediationOwnerId: string | null;
};

function isActiveTaskStatus(status: import("@prisma/client").KitchenTaskStatus): boolean {
  return status !== "DONE" && status !== "CANCELLED";
}

function remediationControlStatus(value: string) {
  return value === "TRACKING" ||
    value === "OWNER_ENGAGED" ||
    value === "SNOOZED" ||
    value === "REASSIGNMENT_REQUESTED"
    ? value
    : "TRACKING";
}

function remediationReviewStatus(value: string) {
  return value === "PENDING" || value === "IN_REMEDIATION" || value === "COMPLETED"
    ? value
    : "PENDING";
}

function effectiveDueAt(incident: IncidentRow): Date | null {
  const controlStatus = remediationControlStatus(incident.remediationControlStatus);
  if (
    controlStatus === "SNOOZED" &&
    incident.remediationSnoozedUntil &&
    (!incident.remediationDueAt ||
      incident.remediationSnoozedUntil.getTime() > incident.remediationDueAt.getTime())
  ) {
    return incident.remediationSnoozedUntil;
  }
  return incident.remediationDueAt;
}

export function expectedRemediationTaskKindForIncident(
  incident: Pick<
    IncidentRow,
    "reviewStatus" | "remediationControlStatus" | "remediationSnoozedUntil" | "remediationDueAt" | "remediationOwnerId"
  >,
  now: Date,
): TaskKind | null {
  if (remediationReviewStatus(incident.reviewStatus) !== "IN_REMEDIATION") return null;

  const controlStatus = remediationControlStatus(incident.remediationControlStatus);
  if (controlStatus === "REASSIGNMENT_REQUESTED") {
    return "reassignment";
  }

  const dueAt = effectiveDueAt({
    ...incident,
    id: "",
    title: "",
    source: "",
    href: "",
    rootCauseCategory: null,
    remediationControlSummary: null,
    assignedToId: null,
  });
  if (controlStatus !== "OWNER_ENGAGED" || !incident.remediationOwnerId || !dueAt) {
    return null;
  }

  return now.getTime() - dueAt.getTime() >= OWNER_ENGAGED_TASK_THRESHOLD_MS
    ? "owner_follow_up"
    : null;
}

function parseTaskKind(metadataJson: unknown): TaskKind | null {
  if (!metadataJson || typeof metadataJson !== "object" || Array.isArray(metadataJson)) {
    return null;
  }
  const metadata = metadataJson as Record<string, unknown>;
  if (metadata.kind !== TASK_METADATA_KIND) return null;
  return metadata.taskKind === "reassignment" || metadata.taskKind === "owner_follow_up"
    ? metadata.taskKind
    : null;
}

export function parseProductionIncidentRemediationTaskMetadata(
  metadataJson: unknown,
): Record<string, unknown> | null {
  if (!metadataJson || typeof metadataJson !== "object" || Array.isArray(metadataJson)) {
    return null;
  }
  const metadata = metadataJson as Record<string, unknown>;
  return metadata.kind === TASK_METADATA_KIND ? metadata : null;
}

function sameDate(a: Date | null, b: Date | null): boolean {
  return (a?.getTime() ?? null) === (b?.getTime() ?? null);
}

function taskDescription(incident: IncidentRow, kind: TaskKind, dueAt: Date | null): string {
  const parts = [
    kind === "reassignment"
      ? "Production incident remediation needs a new owner."
      : "Production incident remediation is still overdue after owner engagement.",
    `Incident: ${incident.title}.`,
    dueAt ? `Due: ${dueAt.toISOString().slice(0, 10)}.` : null,
    incident.rootCauseCategory
      ? `Root cause: ${incident.rootCauseCategory.replace(/_/g, " ")}.`
      : null,
    incident.remediationControlSummary?.trim()
      ? `Context: ${incident.remediationControlSummary.trim()}.`
      : null,
    `Incident hub: ${incident.href}.`,
  ].filter((value): value is string => Boolean(value));
  return parts.join(" ");
}

function desiredTaskForIncident(
  incident: IncidentRow,
  fallbackPlatformOwnerIds: readonly string[],
  now: Date,
): DesiredTaskSpec | null {
  const taskKind = expectedRemediationTaskKindForIncident(incident, now);
  const controlStatus = remediationControlStatus(incident.remediationControlStatus);
  const dueAt = effectiveDueAt(incident);
  if (taskKind === "reassignment") {
    const queueOwnerId =
      incident.assignedToId && incident.assignedToId !== incident.remediationOwnerId
        ? incident.assignedToId
        : fallbackPlatformOwnerIds.find((userId) => userId !== incident.remediationOwnerId) ?? null;
    if (!queueOwnerId) return null;
    return {
      kind: "reassignment",
      userId: queueOwnerId,
      title: `Reassign remediation owner: ${incident.title}`,
      description: taskDescription(incident, "reassignment", dueAt),
      dueAt: now,
      priority: KitchenTaskPriority.URGENT,
      metadataJson: {
        kind: TASK_METADATA_KIND,
        taskKind: "reassignment",
        incidentId: incident.id,
        incidentHref: incident.href,
        controlStatus,
        dueAt: dueAt?.toISOString() ?? null,
        requestedFromUserId: incident.remediationOwnerId ?? null,
      },
    };
  }

  if (taskKind !== "owner_follow_up" || !incident.remediationOwnerId || !dueAt) {
    return null;
  }

  return {
    kind: "owner_follow_up",
    userId: incident.remediationOwnerId,
    title: `Overdue remediation follow-up: ${incident.title}`,
    description: taskDescription(incident, "owner_follow_up", dueAt),
    dueAt,
    priority: KitchenTaskPriority.HIGH,
    metadataJson: {
      kind: TASK_METADATA_KIND,
      taskKind: "owner_follow_up",
      incidentId: incident.id,
      incidentHref: incident.href,
      controlStatus,
      dueAt: dueAt.toISOString(),
        remediationOwnerId: incident.remediationOwnerId,
    },
  };
}

async function loadFallbackPlatformOwnerIds(): Promise<string[]> {
  const rows = await prisma.platformUserRole.findMany({
    where: { role: { in: ["SUPER_ADMIN", "PLATFORM_ADMIN"] } },
    orderBy: [{ createdAt: "asc" }],
    select: { userId: true },
  });
  const seen = new Set<string>();
  return rows
    .map((row) => row.userId)
    .filter((userId) => {
      if (seen.has(userId)) return false;
      seen.add(userId);
      return true;
    });
}

async function loadIncidentRowsByIds(incidentIds: readonly string[]): Promise<IncidentRow[]> {
  if (incidentIds.length === 0) return [];
  return prisma.productionIncident.findMany({
    where: { id: { in: [...incidentIds] } },
    select: {
      id: true,
      title: true,
      source: true,
      href: true,
      reviewStatus: true,
      rootCauseCategory: true,
      remediationControlStatus: true,
      remediationSnoozedUntil: true,
      remediationControlSummary: true,
      remediationDueAt: true,
      remediationOwnerId: true,
      assignedToId: true,
    },
  });
}

async function loadOpenRemediationTasks(): Promise<TaskRow[]> {
  return prisma.kitchenTask.findMany({
    where: {
      sourceType: KitchenTaskSource.PRODUCTION,
      sourceLabel: TASK_SOURCE_LABEL,
      status: { notIn: ["DONE", "CANCELLED"] },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      dueAt: true,
      priority: true,
      status: true,
      createdAt: true,
      metadataJson: true,
    },
  });
}

async function loadTasksForIncident(incidentId: string): Promise<TaskRow[]> {
  return prisma.kitchenTask.findMany({
    where: {
      sourceType: KitchenTaskSource.PRODUCTION,
      sourceId: incidentId,
      sourceLabel: TASK_SOURCE_LABEL,
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      dueAt: true,
      priority: true,
      status: true,
      createdAt: true,
      metadataJson: true,
    },
  });
}

async function createTaskFromSpec(
  incident: IncidentRow,
  spec: DesiredTaskSpec,
): Promise<void> {
  await createTask({
    userId: spec.userId,
    title: spec.title,
    description: spec.description,
    taskType: KitchenTaskType.FOLLOW_UP,
    priority: spec.priority,
    status: KitchenTaskStatus.OPEN,
    dueAt: spec.dueAt,
    sourceType: KitchenTaskSource.PRODUCTION,
    sourceId: incident.id,
    sourceLabel: TASK_SOURCE_LABEL,
    metadata: spec.metadataJson,
    performedBy: "production_incident_remediation_automation",
  });
}

async function updateTaskFromSpec(
  task: TaskRow,
  incidentId: string,
  spec: DesiredTaskSpec,
): Promise<boolean> {
  const changes: Prisma.KitchenTaskUncheckedUpdateInput = {};
  const metadata =
    task.metadataJson && typeof task.metadataJson === "object" && !Array.isArray(task.metadataJson)
      ? (task.metadataJson as Record<string, unknown>)
      : {};
  const nextMetadata =
    spec.kind === "reassignment" &&
    metadata.kind === TASK_METADATA_KIND &&
    metadata.taskKind === "reassignment" &&
    typeof metadata.requestedFromUserId === "string"
      ? ({
          ...(spec.metadataJson as Record<string, unknown>),
          requestedFromUserId: metadata.requestedFromUserId,
        } satisfies Record<string, unknown>)
      : spec.metadataJson;

  if (task.userId !== spec.userId) {
    changes.userId = spec.userId;
    changes.workspaceId = await resolveOwnerWorkspaceId(spec.userId);
  }
  if (task.title !== spec.title) changes.title = spec.title;
  if ((task.description ?? null) !== spec.description) changes.description = spec.description;
  if (!sameDate(task.dueAt, spec.dueAt)) changes.dueAt = spec.dueAt;
  if (task.priority !== spec.priority) changes.priority = spec.priority;
  if (metadata.kind !== TASK_METADATA_KIND || metadata.taskKind !== spec.kind) {
    changes.metadataJson = nextMetadata;
  } else if (JSON.stringify(metadata) !== JSON.stringify(nextMetadata)) {
    changes.metadataJson = nextMetadata;
  }
  if (Object.keys(changes).length === 0) return false;

  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: task.id },
      data: changes,
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId: task.id,
        eventType: KitchenTaskEventType.UPDATED,
        performedBy: "production_incident_remediation_automation",
        metadataJson: {
          incidentId,
          taskKind: spec.kind,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  return true;
}

async function completeTask(
  task: TaskRow,
  reason: string,
  now: Date,
): Promise<void> {
  if (!isActiveTaskStatus(task.status)) return;
  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: task.id },
      data: {
        status: KitchenTaskStatus.DONE,
        completedAt: now,
        completedById: null,
      },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId: task.id,
        eventType: KitchenTaskEventType.COMPLETED,
        performedBy: "production_incident_remediation_automation",
        metadataJson: {
          reason,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

async function syncIncidentTasks(params: {
  incident: IncidentRow | null;
  tasks: TaskRow[];
  fallbackPlatformOwnerIds: readonly string[];
  now: Date;
}): Promise<ProductionIncidentRemediationTaskSyncResult> {
  const result: ProductionIncidentRemediationTaskSyncResult = {
    scanned: params.incident ? 1 : 0,
    created: 0,
    updated: 0,
    completed: 0,
  };

  const relevantTasks = params.tasks.filter((task) => parseTaskKind(task.metadataJson) !== null);
  const desired = params.incident
    ? desiredTaskForIncident(params.incident, params.fallbackPlatformOwnerIds, params.now)
    : null;

  const matchingTasks = desired
    ? relevantTasks.filter((task) => parseTaskKind(task.metadataJson) === desired.kind)
    : [];
  const activeMatchingTasks = matchingTasks.filter((task) => isActiveTaskStatus(task.status));
  const keeper = activeMatchingTasks[0] ?? null;

  if (desired && keeper) {
    const updated = await updateTaskFromSpec(keeper, params.incident!.id, desired);
    result.updated += Number(updated);
  } else if (desired) {
    await createTaskFromSpec(params.incident!, desired);
    result.created += 1;
  }

  const tasksToComplete = relevantTasks.filter((task) => {
    if (!isActiveTaskStatus(task.status)) return false;
    if (!desired) return true;
    if (!keeper) return parseTaskKind(task.metadataJson) !== desired.kind;
    return task.id !== keeper.id;
  });

  for (const task of tasksToComplete) {
    await completeTask(
      task,
      params.incident
        ? "Incident remediation task no longer matches desired automation state."
        : "Incident no longer exists for remediation task sync.",
      params.now,
    );
    result.completed += 1;
  }

  return result;
}

export async function syncProductionIncidentRemediationTasksForIncident(
  incidentId: string,
  now = new Date(),
): Promise<ProductionIncidentRemediationTaskSyncResult> {
  const [fallbackPlatformOwnerIds, incidentRows, taskRows] = await Promise.all([
    loadFallbackPlatformOwnerIds(),
    loadIncidentRowsByIds([incidentId]),
    loadTasksForIncident(incidentId),
  ]);
  return syncIncidentTasks({
    incident: incidentRows[0] ?? null,
    tasks: taskRows,
    fallbackPlatformOwnerIds,
    now,
  });
}

export async function reconcileProductionIncidentRemediationTasks(
  now = new Date(),
): Promise<ProductionIncidentRemediationTaskSyncResult> {
  const [fallbackPlatformOwnerIds, openTasks, remediationIncidents] = await Promise.all([
    loadFallbackPlatformOwnerIds(),
    loadOpenRemediationTasks(),
    prisma.productionIncident.findMany({
      where: {
        reviewStatus: "IN_REMEDIATION",
      },
      select: {
        id: true,
        title: true,
        source: true,
        href: true,
        reviewStatus: true,
        rootCauseCategory: true,
        remediationControlStatus: true,
        remediationSnoozedUntil: true,
        remediationControlSummary: true,
        remediationDueAt: true,
        remediationOwnerId: true,
        assignedToId: true,
      },
    }),
  ]);

  const incidentIdsFromTasks = openTasks
    .map((task) => {
      const metadata =
        task.metadataJson && typeof task.metadataJson === "object" && !Array.isArray(task.metadataJson)
          ? (task.metadataJson as Record<string, unknown>)
          : null;
      return typeof metadata?.incidentId === "string" ? metadata.incidentId : null;
    })
    .filter((value): value is string => Boolean(value));

  const incidentIds = new Set<string>([
    ...remediationIncidents.map((incident) => incident.id),
    ...incidentIdsFromTasks,
  ]);

  const remediationIncidentById = new Map(
    remediationIncidents.map((incident) => [incident.id, incident]),
  );
  const tasksByIncidentId = new Map<string, TaskRow[]>();
  for (const task of openTasks) {
    const metadata =
      task.metadataJson && typeof task.metadataJson === "object" && !Array.isArray(task.metadataJson)
        ? (task.metadataJson as Record<string, unknown>)
        : null;
    const incidentId =
      typeof metadata?.incidentId === "string" ? metadata.incidentId : null;
    if (!incidentId) continue;
    const existing = tasksByIncidentId.get(incidentId) ?? [];
    existing.push(task);
    tasksByIncidentId.set(incidentId, existing);
  }

  const total: ProductionIncidentRemediationTaskSyncResult = {
    scanned: 0,
    created: 0,
    updated: 0,
    completed: 0,
  };

  for (const incidentId of incidentIds) {
    const partial = await syncIncidentTasks({
      incident: remediationIncidentById.get(incidentId) ?? null,
      tasks: tasksByIncidentId.get(incidentId) ?? [],
      fallbackPlatformOwnerIds,
      now,
    });
    total.scanned += partial.scanned;
    total.created += partial.created;
    total.updated += partial.updated;
    total.completed += partial.completed;
  }

  return total;
}

export async function loadActiveProductionIncidentRemediationTaskSnapshots(
  incidentIds: readonly string[],
): Promise<Record<string, ProductionIncidentRemediationTaskSnapshot>> {
  if (incidentIds.length === 0) return {};

  const rows = await prisma.kitchenTask.findMany({
    where: {
      sourceType: KitchenTaskSource.PRODUCTION,
      sourceLabel: TASK_SOURCE_LABEL,
      sourceId: { in: [...incidentIds] },
      status: { notIn: ["DONE", "CANCELLED"] },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      sourceId: true,
      userId: true,
      title: true,
      dueAt: true,
      priority: true,
      status: true,
      createdAt: true,
      metadataJson: true,
      userProfile: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  const snapshots: Record<string, ProductionIncidentRemediationTaskSnapshot> = {};
  for (const row of rows) {
    if (!row.sourceId || snapshots[row.sourceId]) continue;
    const taskKind = parseTaskKind(row.metadataJson);
    if (!taskKind) continue;
    snapshots[row.sourceId] = {
      taskId: row.id,
      taskTitle: row.title,
      taskStatus: row.status,
      taskPriority: row.priority,
      taskKind,
      taskDueAt: row.dueAt?.toISOString() ?? null,
      taskOwnerUserId: row.userId,
      taskOwnerName: row.userProfile?.fullName ?? null,
      taskOwnerEmail: row.userProfile?.email ?? null,
      taskHref: `/platform/tasks/remediation/${row.id}`,
      taskCreatedAt: row.createdAt.toISOString(),
    };
  }

  return snapshots;
}

async function loadRemediationTaskBridgeRow(
  taskId: string,
): Promise<RemediationTaskBridgeRow | null> {
  return prisma.kitchenTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      sourceId: true,
      sourceType: true,
      sourceLabel: true,
      metadataJson: true,
    },
  });
}

async function loadIncidentBridgeRow(
  incidentId: string,
): Promise<RemediationIncidentBridgeRow | null> {
  return prisma.productionIncident.findUnique({
    where: { id: incidentId },
    select: {
      id: true,
      reviewStatus: true,
      remediationControlStatus: true,
      remediationOwnerId: true,
    },
  });
}

function isProductionIncidentRemediationTask(
  task: RemediationTaskBridgeRow | null,
): task is RemediationTaskBridgeRow {
  return Boolean(
    task &&
      task.sourceType === KitchenTaskSource.PRODUCTION &&
      task.sourceLabel === TASK_SOURCE_LABEL &&
      parseTaskKind(task.metadataJson),
  );
}

async function closeReassignmentRequestFromTask(params: {
  task: RemediationTaskBridgeRow;
  incident: RemediationIncidentBridgeRow;
  actorUserId: string;
}): Promise<boolean> {
  const metadata = parseProductionIncidentRemediationTaskMetadata(params.task.metadataJson);
  const requestedFromUserId =
    metadata && typeof metadata.requestedFromUserId === "string"
      ? metadata.requestedFromUserId
      : null;

  if (!requestedFromUserId) return false;
  if (params.incident.reviewStatus !== "IN_REMEDIATION") return false;
  if (params.incident.remediationControlStatus !== "REASSIGNMENT_REQUESTED") return false;
  if (
    !params.incident.remediationOwnerId ||
    params.incident.remediationOwnerId === requestedFromUserId
  ) {
    return false;
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.productionIncident.update({
      where: { id: params.incident.id },
      data: {
        remediationControlStatus: "TRACKING",
        remediationSnoozedUntil: null,
        remediationControlSummary: null,
        remediationControlUpdatedAt: now,
        remediationControlUpdatedByUserId: params.actorUserId,
      },
    }),
    prisma.productionIncidentEvent.create({
      data: {
        incidentId: params.incident.id,
        eventType: "REMEDIATION_CONTROL_UPDATED",
        summary: "Remediation reassignment request closed from follow-up task completion.",
        performedById: params.actorUserId,
        metadataJson: {
          taskId: params.task.id,
          previousRemediationOwnerId: requestedFromUserId,
          remediationOwnerId: params.incident.remediationOwnerId,
          remediationControlStatus: "TRACKING",
          via: "task_completion",
        } as Prisma.InputJsonValue,
        createdAt: now,
      },
    }),
  ]);
  return true;
}

export async function handleProductionIncidentRemediationTaskStatusChange(params: {
  taskId: string;
  to: import("@prisma/client").KitchenTaskStatus;
  actorUserId: string | null;
}): Promise<void> {
  if (params.to !== KitchenTaskStatus.DONE || !params.actorUserId) return;

  const task = await loadRemediationTaskBridgeRow(params.taskId);
  if (!isProductionIncidentRemediationTask(task)) return;

  const incidentId =
    task.sourceId ??
    (parseProductionIncidentRemediationTaskMetadata(task.metadataJson)?.incidentId as
      | string
      | undefined) ??
    null;
  if (!incidentId) return;

  const incident = await loadIncidentBridgeRow(incidentId);
  if (!incident) return;

  const taskKind = parseTaskKind(task.metadataJson);
  if (taskKind === "reassignment") {
    await closeReassignmentRequestFromTask({
      task,
      incident,
      actorUserId: params.actorUserId,
    });
  }

  await syncProductionIncidentRemediationTasksForIncident(incidentId);
}
