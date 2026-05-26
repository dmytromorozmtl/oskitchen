import {
  KitchenTaskEventType,
  KitchenTaskPriority,
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
  type Prisma,
} from "@prisma/client";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  kitchenTaskByIdWhereForOwner,
  kitchenTaskListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  parseChecklist,
  toggleChecklistItem,
  type TaskChecklistItem,
} from "@/lib/tasks/task-checklist";
import { canTransitionStatus, effectiveStatus } from "@/lib/tasks/task-status";
import { handleProductionIncidentRemediationTaskStatusChange } from "@/services/incidents/production-incident-remediation-task-service";

type Scope = { userId: string };

export type TaskListFilter = {
  status?: KitchenTaskStatus | "OVERDUE" | "ALL";
  taskType?: KitchenTaskType;
  priority?: KitchenTaskPriority;
  assignedToId?: string;
  source?: KitchenTaskSource;
  brandId?: string;
  locationId?: string;
  search?: string;
  dueFrom?: Date;
  dueTo?: Date;
  take?: number;
};

async function whereForFilter(scope: Scope, f: TaskListFilter = {}): Promise<Prisma.KitchenTaskWhereInput> {
  const base = await kitchenTaskListWhereForOwner(scope.userId);
  const extra: Prisma.KitchenTaskWhereInput = {};
  if (f.status && f.status !== "ALL" && f.status !== "OVERDUE") extra.status = f.status;
  if (f.status === "OVERDUE") {
    extra.status = { notIn: ["DONE", "CANCELLED"] };
    extra.dueAt = { lt: new Date() };
  }
  if (f.taskType) extra.taskType = f.taskType;
  if (f.priority) extra.priority = f.priority;
  if (f.assignedToId) extra.assignedToId = f.assignedToId;
  if (f.source) extra.sourceType = f.source;
  if (f.brandId) extra.brandId = f.brandId;
  if (f.locationId) extra.locationId = f.locationId;
  if (f.search) extra.title = { contains: f.search, mode: "insensitive" };
  if (f.dueFrom || f.dueTo) {
    extra.dueAt = {
      ...(extra.dueAt && typeof extra.dueAt === "object" ? extra.dueAt : {}),
      ...(f.dueFrom ? { gte: f.dueFrom } : {}),
      ...(f.dueTo ? { lte: f.dueTo } : {}),
    };
  }
  return { AND: [base, extra] };
}

export async function listTasksForUser(scope: Scope, filter: TaskListFilter = {}) {
  return prisma.kitchenTask.findMany({
    where: await whereForFilter(scope, filter),
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: filter.take ?? 200,
  });
}

export async function getTaskForUser(scope: Scope, taskId: string) {
  return prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    include: {
      assignedTo: { select: { id: true, name: true, role: true, email: true } },
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      relatedOrder: { select: { id: true, customerName: true, status: true } },
      relatedProduct: { select: { id: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, email: true, fullName: true } } },
      },
      events: { orderBy: { createdAt: "desc" }, take: 100 },
      recurrence: true,
      dependsOn: {
        include: { dependsOn: { select: { id: true, title: true, status: true } } },
      },
      createdBy: { select: { id: true, email: true, fullName: true } },
      completedBy: { select: { id: true, email: true, fullName: true } },
    },
  });
}

export type CreateTaskInput = {
  userId: string;
  title: string;
  description?: string | null;
  taskType: KitchenTaskType;
  priority?: KitchenTaskPriority;
  status?: KitchenTaskStatus;
  assignedToId?: string | null;
  assignedRole?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  dueAt?: Date | null;
  estimatedMinutes?: number | null;
  sourceType?: KitchenTaskSource;
  sourceId?: string | null;
  sourceLabel?: string | null;
  tags?: string[] | null;
  checklist?: TaskChecklistItem[] | null;
  recurrenceRule?: string | null;
  createdById?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  performedBy?: string | null;
};

export async function createTask(input: CreateTaskInput): Promise<string> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const task = await prisma.kitchenTask.create({
    data: {
      userId: input.userId,
      workspaceId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      taskType: input.taskType,
      priority: input.priority ?? KitchenTaskPriority.MEDIUM,
      status: input.status ?? KitchenTaskStatus.OPEN,
      assignedToId: input.assignedToId ?? null,
      assignedRole: input.assignedRole?.trim() || null,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      dueAt: input.dueAt ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      sourceType: input.sourceType ?? KitchenTaskSource.MANUAL,
      sourceId: input.sourceId ?? null,
      sourceLabel: input.sourceLabel?.slice(0, 255) ?? null,
      tagsJson: input.tags && input.tags.length > 0 ? (input.tags as unknown as Prisma.InputJsonValue) : undefined,
      checklistJson: input.checklist && input.checklist.length > 0 ? (input.checklist as unknown as Prisma.InputJsonValue) : undefined,
      recurrenceRule: input.recurrenceRule?.trim() || null,
      createdById: input.createdById ?? null,
      metadataJson: input.metadata ?? undefined,
    },
  });

  await prisma.kitchenTaskEvent.create({
    data: {
      taskId: task.id,
      eventType: KitchenTaskEventType.CREATED,
      performedBy: input.performedBy?.slice(0, 255) ?? null,
      metadataJson: { sourceType: input.sourceType ?? "MANUAL" } as Prisma.InputJsonValue,
    },
  });

  if (input.recurrenceRule) {
    await prisma.kitchenTaskRecurrence.create({
      data: { taskId: task.id, rule: input.recurrenceRule.trim() },
    });
  }

  return task.id;
}

export type UpdateStatusInput = {
  taskId: string;
  to: KitchenTaskStatus;
  blockedReason?: string | null;
  performedBy?: string | null;
  performedByUserId?: string | null;
};

export async function updateTaskStatus(scope: Scope, input: UpdateStatusInput) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, input.taskId),
    select: { id: true, status: true, startedAt: true, completedAt: true },
  });
  if (!task) throw new Error("Task not found.");
  if (!canTransitionStatus(task.status, input.to)) {
    throw new Error(`Cannot transition task from ${task.status} to ${input.to}.`);
  }

  const now = new Date();
  const startedAt = task.startedAt ?? (input.to === "IN_PROGRESS" ? now : null);
  const completedAt = input.to === "DONE" ? now : input.to === "OPEN" || input.to === "IN_PROGRESS" ? null : task.completedAt;
  const actualMinutes =
    input.to === "DONE" && startedAt ? Math.max(1, Math.round((now.getTime() - startedAt.getTime()) / 60000)) : undefined;

  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: input.taskId },
      data: {
        status: input.to,
        startedAt: startedAt,
        completedAt: completedAt,
        actualMinutes: actualMinutes ?? undefined,
        blockedReason: input.to === "BLOCKED" ? input.blockedReason ?? null : null,
        completedById: input.to === "DONE" && input.performedBy ? scope.userId : input.to !== "DONE" ? null : undefined,
      },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId: input.taskId,
        eventType: mapStatusToEvent(input.to),
        performedBy: input.performedBy?.slice(0, 255) ?? null,
        metadataJson: { from: task.status, to: input.to, reason: input.blockedReason ?? undefined } as Prisma.InputJsonValue,
      },
    }),
  ]);

  try {
    await handleProductionIncidentRemediationTaskStatusChange({
      taskId: input.taskId,
      to: input.to,
      actorUserId: input.performedByUserId ?? null,
    });
  } catch (error) {
    logger.warn("production_incident_remediation_task_bridge_failed", {
      taskId: input.taskId,
      to: input.to,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

function mapStatusToEvent(to: KitchenTaskStatus): KitchenTaskEventType {
  switch (to) {
    case "IN_PROGRESS": return KitchenTaskEventType.STARTED;
    case "BLOCKED":     return KitchenTaskEventType.BLOCKED;
    case "WAITING":     return KitchenTaskEventType.STATUS_CHANGED;
    case "DONE":        return KitchenTaskEventType.COMPLETED;
    case "CANCELLED":   return KitchenTaskEventType.CANCELLED;
    case "OPEN":        return KitchenTaskEventType.UNBLOCKED;
    case "TODO":        return KitchenTaskEventType.STATUS_CHANGED;
  }
}

export async function assignTask(
  scope: Scope,
  taskId: string,
  assignedToId: string | null,
  assignedRole: string | null,
  performedBy: string | null,
) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    select: { id: true },
  });
  if (!task) throw new Error("Task not found.");
  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: taskId },
      data: { assignedToId, assignedRole: assignedRole?.trim() || null },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId,
        eventType: assignedToId ? KitchenTaskEventType.ASSIGNED : KitchenTaskEventType.ROLE_ASSIGNED,
        performedBy: performedBy?.slice(0, 255) ?? null,
        metadataJson: { assignedToId, assignedRole } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

export async function updatePriority(
  scope: Scope,
  taskId: string,
  priority: KitchenTaskPriority,
  performedBy: string | null,
) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    select: { id: true, priority: true },
  });
  if (!task) throw new Error("Task not found.");
  await prisma.$transaction([
    prisma.kitchenTask.update({ where: { id: taskId }, data: { priority } }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId,
        eventType: KitchenTaskEventType.PRIORITY_CHANGED,
        performedBy: performedBy?.slice(0, 255) ?? null,
        metadataJson: { from: task.priority, to: priority } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

export async function rescheduleTask(
  scope: Scope,
  taskId: string,
  dueAt: Date | null,
  performedBy: string | null,
) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    select: { id: true, dueAt: true },
  });
  if (!task) throw new Error("Task not found.");
  await prisma.$transaction([
    prisma.kitchenTask.update({ where: { id: taskId }, data: { dueAt } }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId,
        eventType: KitchenTaskEventType.RESCHEDULED,
        performedBy: performedBy?.slice(0, 255) ?? null,
        metadataJson: { from: task.dueAt, to: dueAt } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

export async function addComment(
  scope: Scope,
  taskId: string,
  authorId: string | null,
  authorLabel: string | null,
  content: string,
) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    select: { id: true },
  });
  if (!task) throw new Error("Task not found.");
  await prisma.$transaction([
    prisma.kitchenTaskComment.create({
      data: { taskId, authorId, authorLabel: authorLabel?.slice(0, 255) ?? null, content: content.trim() },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId,
        eventType: KitchenTaskEventType.COMMENT_ADDED,
        performedBy: authorLabel?.slice(0, 255) ?? null,
      },
    }),
  ]);
}

export async function toggleChecklist(
  scope: Scope,
  taskId: string,
  itemId: string,
  completed: boolean,
  performedBy: string | null,
) {
  const task = await prisma.kitchenTask.findFirst({
    where: await kitchenTaskByIdWhereForOwner(scope.userId, taskId),
    select: { id: true, checklistJson: true },
  });
  if (!task) throw new Error("Task not found.");
  const items = parseChecklist(task.checklistJson);
  if (!items.find((i) => i.id === itemId)) throw new Error("Checklist item not found.");
  const next = toggleChecklistItem(items, itemId, completed, performedBy);
  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: taskId },
      data: { checklistJson: next as unknown as Prisma.InputJsonValue },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId,
        eventType: completed
          ? KitchenTaskEventType.CHECKLIST_ITEM_COMPLETED
          : KitchenTaskEventType.CHECKLIST_ITEM_UNCHECKED,
        performedBy: performedBy?.slice(0, 255) ?? null,
        metadataJson: { itemId } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

/** Public helper for cross-module integration (routes, packing, alerts, etc.) */
export async function createFollowUpTask(args: {
  userId: string;
  title: string;
  source: KitchenTaskSource;
  sourceId?: string | null;
  sourceLabel?: string | null;
  taskType?: KitchenTaskType;
  priority?: KitchenTaskPriority;
  assignedRole?: string | null;
  dueAt?: Date | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  performedBy?: string | null;
}): Promise<string> {
  return createTask({
    userId: args.userId,
    title: args.title,
    description: args.description ?? null,
    taskType: args.taskType ?? KitchenTaskType.FOLLOW_UP,
    priority: args.priority ?? KitchenTaskPriority.HIGH,
    sourceType: args.source,
    sourceId: args.sourceId ?? null,
    sourceLabel: args.sourceLabel ?? null,
    assignedRole: args.assignedRole ?? null,
    dueAt: args.dueAt ?? null,
    metadata: args.metadata ?? undefined,
    performedBy: args.performedBy ?? null,
  });
}

/** Light KPI loader for overview / Today Board. */
export async function loadTaskOverviewKpis(userId: string, now = new Date()): Promise<{
  dueToday: number;
  overdue: number;
  blocked: number;
  inProgress: number;
  completedToday: number;
  unassigned: number;
  urgent: number;
  fromPlaybooks: number;
}> {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const taskScope = await kitchenTaskListWhereForOwner(userId);
  const [dueToday, overdue, blocked, inProgress, completedToday, unassigned, urgent, fromPlaybooks] = await Promise.all([
    prisma.kitchenTask.count({
      where: {
        AND: [taskScope, { dueAt: { gte: dayStart, lte: dayEnd }, status: { notIn: ["DONE", "CANCELLED"] } }],
      },
    }),
    prisma.kitchenTask.count({
      where: {
        AND: [taskScope, { dueAt: { lt: dayStart }, status: { notIn: ["DONE", "CANCELLED"] } }],
      },
    }),
    prisma.kitchenTask.count({ where: { AND: [taskScope, { status: "BLOCKED" }] } }),
    prisma.kitchenTask.count({ where: { AND: [taskScope, { status: "IN_PROGRESS" }] } }),
    prisma.kitchenTask.count({
      where: {
        AND: [taskScope, { status: "DONE", completedAt: { gte: dayStart, lte: dayEnd } }],
      },
    }),
    prisma.kitchenTask.count({
      where: {
        AND: [taskScope, { assignedToId: null, status: { notIn: ["DONE", "CANCELLED"] } }],
      },
    }),
    prisma.kitchenTask.count({
      where: {
        AND: [
          taskScope,
          { priority: { in: ["URGENT", "CRITICAL"] }, status: { notIn: ["DONE", "CANCELLED"] } },
        ],
      },
    }),
    prisma.kitchenTask.count({ where: { AND: [taskScope, { sourceType: "PLAYBOOK" }] } }),
  ]);

  return { dueToday, overdue, blocked, inProgress, completedToday, unassigned, urgent, fromPlaybooks };
}

/** Derived helper for views that need OVERDUE classification per row. */
export function classifyTasksWithOverdue<T extends { status: KitchenTaskStatus; dueAt: Date | null }>(
  tasks: readonly T[],
  now = new Date(),
): Array<T & { derivedStatus: ReturnType<typeof effectiveStatus> }> {
  return tasks.map((t) => ({ ...t, derivedStatus: effectiveStatus(t.status, t.dueAt, now) }));
}
