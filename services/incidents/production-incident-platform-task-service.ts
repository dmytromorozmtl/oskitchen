import {
  KitchenTaskEventType,
  KitchenTaskPriority,
  KitchenTaskSource,
  KitchenTaskStatus,
  type Prisma,
} from "@prisma/client";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { canTransitionStatus } from "@/lib/tasks/task-status";
import {
  handleProductionIncidentRemediationTaskStatusChange,
  parseProductionIncidentRemediationTaskMetadata,
  PRODUCTION_INCIDENT_REMEDIATION_TASK_SOURCE_LABEL,
} from "@/services/incidents/production-incident-remediation-task-service";

export type PlatformProductionIncidentRemediationTaskDetail = {
  id: string;
  title: string;
  description: string | null;
  checklistJson: unknown;
  status: KitchenTaskStatus;
  priority: KitchenTaskPriority;
  dueAt: Date | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  actualMinutes: number | null;
  estimatedMinutes: number | null;
  blockedReason: string | null;
  sourceLabel: string | null;
  sourceId: string | null;
  metadataJson: unknown;
  ownerUserId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    authorLabel: string | null;
    author: { fullName: string | null; email: string } | null;
  }>;
  events: Array<{
    id: string;
    eventType: string;
    performedBy: string | null;
    createdAt: Date;
  }>;
  incident: {
    id: string;
    title: string;
    href: string;
    workflowStatus: string;
    reviewStatus: string;
    remediationControlStatus: string;
    remediationOwnerId: string | null;
    remediationOwnerName: string | null;
    remediationOwnerEmail: string | null;
    remediationDueAt: Date | null;
  } | null;
};

function platformRemediationTaskWhere(taskId: string): Prisma.KitchenTaskWhereInput {
  return {
    id: taskId,
    sourceType: KitchenTaskSource.PRODUCTION,
    sourceLabel: PRODUCTION_INCIDENT_REMEDIATION_TASK_SOURCE_LABEL,
  };
}

function isSupportedRemediationTask(metadataJson: unknown): boolean {
  const metadata = parseProductionIncidentRemediationTaskMetadata(metadataJson);
  if (!metadata) return false;
  return metadata.taskKind === "reassignment" || metadata.taskKind === "owner_follow_up";
}

export async function getProductionIncidentRemediationTaskForPlatform(
  taskId: string,
): Promise<PlatformProductionIncidentRemediationTaskDetail | null> {
  const task = await prisma.kitchenTask.findFirst({
    where: platformRemediationTaskWhere(taskId),
    include: {
      userProfile: { select: { id: true, fullName: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { fullName: true, email: true } } },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });
  if (!task || !isSupportedRemediationTask(task.metadataJson)) return null;

  const incidentId =
    task.sourceId ??
    ((parseProductionIncidentRemediationTaskMetadata(task.metadataJson)?.incidentId as string | undefined) ??
      null);
  const incident = incidentId
    ? await prisma.productionIncident.findUnique({
        where: { id: incidentId },
        select: {
          id: true,
          title: true,
          href: true,
          workflowStatus: true,
          reviewStatus: true,
          remediationControlStatus: true,
          remediationOwnerId: true,
          remediationDueAt: true,
          remediationOwner: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      })
    : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    checklistJson: task.checklistJson,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt ?? null,
    createdAt: task.createdAt,
    startedAt: task.startedAt ?? null,
    completedAt: task.completedAt ?? null,
    actualMinutes: task.actualMinutes ?? null,
    estimatedMinutes: task.estimatedMinutes ?? null,
    blockedReason: task.blockedReason ?? null,
    sourceLabel: task.sourceLabel ?? null,
    sourceId: task.sourceId ?? null,
    metadataJson: task.metadataJson,
    ownerUserId: task.userId,
    ownerName: task.userProfile?.fullName ?? null,
    ownerEmail: task.userProfile?.email ?? null,
    comments: task.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      authorLabel: comment.authorLabel ?? null,
      author: comment.author
        ? {
            fullName: comment.author.fullName ?? null,
            email: comment.author.email,
          }
        : null,
    })),
    events: task.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      performedBy: event.performedBy ?? null,
      createdAt: event.createdAt,
    })),
    incident: incident
      ? {
          id: incident.id,
          title: incident.title,
          href: incident.href,
          workflowStatus: incident.workflowStatus,
          reviewStatus: incident.reviewStatus,
          remediationControlStatus: incident.remediationControlStatus,
          remediationOwnerId: incident.remediationOwnerId ?? null,
          remediationOwnerName: incident.remediationOwner?.fullName ?? null,
          remediationOwnerEmail: incident.remediationOwner?.email ?? null,
          remediationDueAt: incident.remediationDueAt ?? null,
        }
      : null,
  };
}

export async function updateProductionIncidentRemediationTaskStatusForPlatform(params: {
  taskId: string;
  to: KitchenTaskStatus;
  actorUserId: string;
  performedBy: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const task = await prisma.kitchenTask.findFirst({
    where: platformRemediationTaskWhere(params.taskId),
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      metadataJson: true,
    },
  });
  if (!task || !isSupportedRemediationTask(task.metadataJson)) {
    return { error: "Production incident remediation task not found." };
  }
  if (!canTransitionStatus(task.status, params.to)) {
    return { error: `Cannot transition task from ${task.status} to ${params.to}.` };
  }

  const now = new Date();
  const startedAt = task.startedAt ?? (params.to === "IN_PROGRESS" ? now : null);
  const completedAt =
    params.to === "DONE"
      ? now
      : params.to === "OPEN" || params.to === "IN_PROGRESS"
        ? null
        : task.completedAt;
  const actualMinutes =
    params.to === "DONE" && startedAt
      ? Math.max(1, Math.round((now.getTime() - startedAt.getTime()) / 60000))
      : undefined;

  await prisma.$transaction([
    prisma.kitchenTask.update({
      where: { id: params.taskId },
      data: {
        status: params.to,
        startedAt,
        completedAt,
        actualMinutes: actualMinutes ?? undefined,
        blockedReason: null,
        completedById: params.to === "DONE" ? params.actorUserId : null,
      },
    }),
    prisma.kitchenTaskEvent.create({
      data: {
        taskId: params.taskId,
        eventType:
          params.to === "IN_PROGRESS"
            ? KitchenTaskEventType.STARTED
            : params.to === "BLOCKED"
              ? KitchenTaskEventType.BLOCKED
              : params.to === "WAITING" || params.to === "TODO"
                ? KitchenTaskEventType.STATUS_CHANGED
                : params.to === "DONE"
                  ? KitchenTaskEventType.COMPLETED
                  : params.to === "CANCELLED"
                    ? KitchenTaskEventType.CANCELLED
                    : KitchenTaskEventType.UNBLOCKED,
        performedBy: params.performedBy?.slice(0, 255) ?? null,
        metadataJson: { from: task.status, to: params.to } as Prisma.InputJsonValue,
      },
    }),
  ]);

  try {
    await handleProductionIncidentRemediationTaskStatusChange({
      taskId: params.taskId,
      to: params.to,
      actorUserId: params.actorUserId,
    });
  } catch (error) {
    logger.warn("production_incident_platform_task_bridge_failed", {
      taskId: params.taskId,
      to: params.to,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return { ok: true };
}
