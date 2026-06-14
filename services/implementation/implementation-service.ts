import { Prisma } from "@prisma/client";
import type {
  BusinessType,
  GoLiveReadinessStatus,
  ImplementationChecklistItem,
  ImplementationChecklistPriority,
  ImplementationChecklistStatus,
  ImplementationEvent,
  ImplementationPhase,
  ImplementationPhaseKey,
  ImplementationPhaseStatus,
  ImplementationProject,
  ImplementationStatus,
} from "@prisma/client";

import { CHECKLIST_TEMPLATES, checklistTemplateFor } from "@/lib/implementation/implementation-checklists";
import { isActiveStatus } from "@/lib/implementation/implementation-status";
import {
  PHASE_DEFINITIONS,
  type ChecklistSeed,
  type ImplementationActorScope,
} from "@/lib/implementation/implementation-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  implementationProjectByIdWhereForOwner,
  implementationProjectListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type ImplementationProjectWithRelations = ImplementationProject & {
  phases: ImplementationPhase[];
  checklistItems: ImplementationChecklistItem[];
};

export type CreateProjectInput = {
  userId: string;
  createdById?: string | null;
  performedBy?: string | null;
  businessName: string;
  businessType?: BusinessType | null;
  currentPlatform?: string | null;
  weeklyOrderVolume?: number | null;
  targetGoLiveDate?: Date | null;
  assignedOwner?: string | null;
  notes?: string | null;
  templateKey?: string | null;
  systems?: string[];
  fulfillment?: string[];
  migrationScope?: string[];
  moduleScope?: string[];
  integrations?: string[];
  trainingRoles?: string[];
};

const BUSINESS_TYPE_VALUES = new Set<BusinessType>([
  "MEAL_PREP",
  "CATERING",
  "GHOST_KITCHEN",
  "CLOUD_KITCHEN",
  "MULTI_BRAND",
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "BAR",
  "OTHER",
]);

export function parseBusinessType(value: string | null | undefined): BusinessType | null {
  if (!value) return null;
  const normalised = value.toUpperCase();
  return BUSINESS_TYPE_VALUES.has(normalised as BusinessType) ? (normalised as BusinessType) : null;
}

async function seedPhasesAndChecklist(
  projectId: string,
  businessType: BusinessType | null | undefined,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const phaseInputs: Prisma.ImplementationPhaseCreateManyInput[] = PHASE_DEFINITIONS.map((phase) => ({
      projectId,
      key: phase.key,
      name: phase.name,
      sortOrder: phase.sortOrder,
      status: "NOT_STARTED",
    }));
    await tx.implementationPhase.createMany({ data: phaseInputs, skipDuplicates: true });

    const phases = await tx.implementationPhase.findMany({ where: { projectId } });
    const phaseByKey = new Map<ImplementationPhaseKey, string>(phases.map((p) => [p.key, p.id] as const));

    const template = checklistTemplateFor(businessType ?? null);
    const itemInputs: Prisma.ImplementationChecklistItemCreateManyInput[] = template.items.map(
      (item: ChecklistSeed) => ({
        projectId,
        phaseId: phaseByKey.get(item.phaseKey) ?? null,
        title: item.title,
        description: item.description ?? null,
        priority: item.priority,
        moduleKey: item.moduleKey ?? null,
        actionRoute: item.actionRoute ?? null,
        requiredForGoLive: item.requiredForGoLive ?? false,
        status: "TODO",
      }),
    );
    await tx.implementationChecklistItem.createMany({ data: itemInputs });
  });
}

export async function createImplementationProjectV2(input: CreateProjectInput): Promise<ImplementationProject> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const project = await prisma.implementationProject.create({
    data: {
      userId: input.userId,
      workspaceId,
      businessName: input.businessName,
      businessType: input.businessType ?? null,
      currentPlatform: input.currentPlatform ?? null,
      weeklyOrderVolume: input.weeklyOrderVolume ?? null,
      targetGoLiveDate: input.targetGoLiveDate ?? null,
      assignedOwner: input.assignedOwner ?? null,
      notes: input.notes ?? null,
      status: "DISCOVERY",
      createdBy: input.createdById ?? input.userId,
    },
  });

  await seedPhasesAndChecklist(project.id, input.businessType ?? null);

  await recordEvent({
    projectId: project.id,
    eventType: "project_created",
    performedBy: input.performedBy ?? null,
    summary: `Project "${input.businessName}" created`,
    metadata: {
      businessType: input.businessType ?? null,
      systems: input.systems ?? [],
      fulfillment: input.fulfillment ?? [],
      migrationScope: input.migrationScope ?? [],
      moduleScope: input.moduleScope ?? [],
      integrations: input.integrations ?? [],
      trainingRoles: input.trainingRoles ?? [],
    },
  });

  return project;
}

export async function listProjects(userId: string): Promise<ImplementationProject[]> {
  return prisma.implementationProject.findMany({
    where: await implementationProjectListWhereForOwner(userId),
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getActiveProject(userId: string): Promise<ImplementationProject | null> {
  const scope = await implementationProjectListWhereForOwner(userId);
  const active = await prisma.implementationProject.findFirst({
    where: {
      AND: [
        scope,
        {
          status: {
            in: [
              "DISCOVERY",
              "SETUP",
              "MIGRATION",
              "TRAINING",
              "TESTING",
              "READY_FOR_GO_LIVE",
              "DATA_IMPORT",
              "CONFIGURATION",
              "STAFF_TRAINING",
              "TEST_RUN",
            ],
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
  if (active) return active;
  return prisma.implementationProject.findFirst({ where: scope, orderBy: { createdAt: "desc" } });
}

export async function getProject(userId: string, projectId: string): Promise<ImplementationProjectWithRelations | null> {
  const project = await prisma.implementationProject.findFirst({
    where: await implementationProjectByIdWhereForOwner(userId, projectId),
    include: {
      phases: { orderBy: { sortOrder: "asc" } },
      checklistItems: { orderBy: [{ priority: "desc" }, { createdAt: "asc" }] },
    },
  });
  return project ?? null;
}

export async function updateProjectStatus(params: {
  userId: string;
  projectId: string;
  status: ImplementationStatus;
  performedBy?: string | null;
  reason?: string | null;
}): Promise<ImplementationProject> {
  const project = await prisma.implementationProject.findFirst({
    where: await implementationProjectByIdWhereForOwner(params.userId, params.projectId),
  });
  if (!project) throw new Error("Project not found");

  const updated = await prisma.implementationProject.update({
    where: { id: project.id },
    data: { status: params.status },
  });

  await recordEvent({
    projectId: project.id,
    eventType: "status_changed",
    performedBy: params.performedBy ?? null,
    summary: `Status changed: ${project.status} → ${params.status}`,
    metadata: { from: project.status, to: params.status, reason: params.reason ?? null },
  });

  return updated;
}

export async function updateChecklistItemStatus(params: {
  userId: string;
  projectId: string;
  itemId: string;
  status: ImplementationChecklistStatus;
  blockerReason?: string | null;
  performedBy?: string | null;
}): Promise<ImplementationChecklistItem> {
  const item = await prisma.implementationChecklistItem.findFirst({
    where: {
      id: params.itemId,
      projectId: params.projectId,
      project: await implementationProjectListWhereForOwner(params.userId),
    },
  });
  if (!item) throw new Error("Checklist item not found");

  const updated = await prisma.implementationChecklistItem.update({
    where: { id: item.id },
    data: {
      status: params.status,
      blockerReason: params.status === "BLOCKED" ? params.blockerReason ?? "Blocker noted" : null,
      completedAt: params.status === "DONE" ? new Date() : null,
    },
  });

  await recordEvent({
    projectId: params.projectId,
    eventType: "checklist_status_changed",
    performedBy: params.performedBy ?? null,
    summary: `Checklist "${item.title}" → ${params.status}`,
    metadata: { itemId: item.id, from: item.status, to: params.status },
  });

  return updated;
}

export async function assignChecklistItem(params: {
  userId: string;
  projectId: string;
  itemId: string;
  assignedToId: string | null;
  dueAt: Date | null;
  performedBy?: string | null;
}): Promise<ImplementationChecklistItem> {
  const item = await prisma.implementationChecklistItem.findFirst({
    where: {
      id: params.itemId,
      projectId: params.projectId,
      project: await implementationProjectListWhereForOwner(params.userId),
    },
  });
  if (!item) throw new Error("Checklist item not found");

  const updated = await prisma.implementationChecklistItem.update({
    where: { id: item.id },
    data: { assignedToId: params.assignedToId, dueAt: params.dueAt },
  });

  await recordEvent({
    projectId: params.projectId,
    eventType: "checklist_assigned",
    performedBy: params.performedBy ?? null,
    summary: `Checklist "${item.title}" assigned`,
    metadata: { itemId: item.id, assignedToId: params.assignedToId, dueAt: params.dueAt },
  });

  return updated;
}

export async function updatePhaseStatus(params: {
  userId: string;
  projectId: string;
  phaseId: string;
  status: ImplementationPhaseStatus;
  performedBy?: string | null;
}): Promise<ImplementationPhase> {
  const phase = await prisma.implementationPhase.findFirst({
    where: {
      id: params.phaseId,
      projectId: params.projectId,
      project: await implementationProjectListWhereForOwner(params.userId),
    },
  });
  if (!phase) throw new Error("Phase not found");

  const updated = await prisma.implementationPhase.update({
    where: { id: phase.id },
    data: {
      status: params.status,
      completedAt: params.status === "COMPLETED" ? new Date() : null,
    },
  });

  await recordEvent({
    projectId: params.projectId,
    eventType: "phase_status_changed",
    performedBy: params.performedBy ?? null,
    summary: `Phase ${phase.name} → ${params.status}`,
    metadata: { phaseId: phase.id, from: phase.status, to: params.status },
  });

  return updated;
}

export type PreviewedTask = {
  itemId: string;
  title: string;
  description: string | null;
  taskType: "ADMIN";
  assignedToId: string | null;
  dueAt: Date | null;
  alreadyExists: boolean;
  existingTaskId: string | null;
};

export async function previewTasksFromChecklist(params: {
  userId: string;
  projectId: string;
}): Promise<PreviewedTask[]> {
  const project = await prisma.implementationProject.findFirst({
    where: await implementationProjectByIdWhereForOwner(params.userId, params.projectId),
    include: {
      checklistItems: {
        where: { status: { in: ["TODO", "IN_PROGRESS"] } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!project) return [];

  const existingTasks = await prisma.kitchenTask.findMany({
    where: {
      userId: params.userId,
      sourceType: "IMPLEMENTATION",
      sourceId: project.id,
    },
    select: { id: true, title: true },
  });
  const existingByTitle = new Map(existingTasks.map((t) => [t.title.toLowerCase(), t.id]));

  return project.checklistItems.map((item) => {
    const alreadyExists = existingByTitle.has(item.title.toLowerCase()) || item.taskId !== null;
    const existingTaskId = item.taskId ?? existingByTitle.get(item.title.toLowerCase()) ?? null;
    return {
      itemId: item.id,
      title: item.title,
      description: item.description,
      taskType: "ADMIN" as const,
      assignedToId: item.assignedToId,
      dueAt: item.dueAt,
      alreadyExists,
      existingTaskId,
    };
  });
}

export async function generateTasksFromChecklist(params: {
  userId: string;
  projectId: string;
  itemIds: string[];
  performedBy?: string | null;
}): Promise<{ created: number; skipped: number }> {
  const project = await prisma.implementationProject.findFirst({
    where: await implementationProjectByIdWhereForOwner(params.userId, params.projectId),
  });
  if (!project) throw new Error("Project not found");

  const items = await prisma.implementationChecklistItem.findMany({
    where: { projectId: project.id, id: { in: params.itemIds } },
  });
  if (items.length === 0) return { created: 0, skipped: 0 };

  let created = 0;
  let skipped = 0;
  for (const item of items) {
    if (item.taskId) {
      skipped += 1;
      continue;
    }
    const existing = await prisma.kitchenTask.findFirst({
      where: {
        userId: params.userId,
        sourceType: "IMPLEMENTATION",
        sourceId: project.id,
        title: item.title,
      },
      select: { id: true },
    });
    if (existing) {
      await prisma.implementationChecklistItem.update({
        where: { id: item.id },
        data: { taskId: existing.id },
      });
      skipped += 1;
      continue;
    }

    const task = await prisma.kitchenTask.create({
      data: {
        userId: params.userId,
        title: item.title,
        description: item.description,
        taskType: "ADMIN",
        status: "OPEN",
        priority: item.priority === "CRITICAL" || item.priority === "HIGH" ? "HIGH" : "MEDIUM",
        sourceType: "IMPLEMENTATION",
        sourceId: project.id,
        sourceLabel: project.businessName,
        assignedToId: item.assignedToId,
        dueAt: item.dueAt,
      },
    });

    await prisma.implementationChecklistItem.update({
      where: { id: item.id },
      data: { taskId: task.id },
    });
    created += 1;
  }

  await recordEvent({
    projectId: project.id,
    eventType: "tasks_generated",
    performedBy: params.performedBy ?? null,
    summary: `Generated ${created} tasks (${skipped} skipped)`,
    metadata: { created, skipped, requested: params.itemIds.length },
  });

  return { created, skipped };
}

export async function listRisks(projectId: string, userId: string) {
  return prisma.implementationRisk.findMany({
    where: { projectId, project: await implementationProjectListWhereForOwner(userId) },
    orderBy: { createdAt: "desc" },
  });
}

export async function addRisk(params: {
  userId: string;
  projectId: string;
  title: string;
  mitigation?: string | null;
  severity?: string;
  performedBy?: string | null;
}) {
  const project = await prisma.implementationProject.findFirst({
    where: await implementationProjectByIdWhereForOwner(params.userId, params.projectId),
  });
  if (!project) throw new Error("Project not found");

  const risk = await prisma.implementationRisk.create({
    data: {
      projectId: project.id,
      title: params.title,
      mitigation: params.mitigation ?? null,
      severity: params.severity ?? "medium",
      status: "open",
    },
  });

  await recordEvent({
    projectId: project.id,
    eventType: "risk_added",
    performedBy: params.performedBy ?? null,
    summary: `Risk added: ${params.title}`,
    metadata: { riskId: risk.id, severity: params.severity ?? "medium" },
  });

  return risk;
}

export async function resolveRisk(params: {
  userId: string;
  projectId: string;
  riskId: string;
  performedBy?: string | null;
}) {
  const risk = await prisma.implementationRisk.findFirst({
    where: {
      id: params.riskId,
      projectId: params.projectId,
      project: await implementationProjectListWhereForOwner(params.userId),
    },
  });
  if (!risk) throw new Error("Risk not found");

  const updated = await prisma.implementationRisk.update({
    where: { id: risk.id },
    data: { status: "resolved" },
  });

  await recordEvent({
    projectId: params.projectId,
    eventType: "risk_resolved",
    performedBy: params.performedBy ?? null,
    summary: `Risk resolved: ${risk.title}`,
    metadata: { riskId: risk.id },
  });

  return updated;
}

export async function recordEvent(params: {
  projectId: string;
  eventType: string;
  performedBy?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<ImplementationEvent> {
  return prisma.implementationEvent.create({
    data: {
      projectId: params.projectId,
      eventType: params.eventType,
      performedBy: params.performedBy ?? null,
      summary: params.summary ?? null,
      metadataJson: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listEvents(projectId: string, userId: string, take = 100) {
  return prisma.implementationEvent.findMany({
    where: { projectId, project: await implementationProjectListWhereForOwner(userId) },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function projectKpis(userId: string): Promise<{
  activeProjects: number;
  blockers: number;
  daysToGoLive: number | null;
  tasksCompleted: number;
  tasksTotal: number;
}> {
  const projectScope = await implementationProjectListWhereForOwner(userId);
  const [projects, activeChecks, completedTasks, totalTasks] = await Promise.all([
    prisma.implementationProject.findMany({
      where: projectScope,
      select: { id: true, status: true, targetGoLiveDate: true },
    }),
    prisma.implementationChecklistItem.count({
      where: { project: projectScope, status: "BLOCKED" },
    }),
    prisma.implementationChecklistItem.count({
      where: { project: projectScope, status: "DONE" },
    }),
    prisma.implementationChecklistItem.count({ where: { project: projectScope } }),
  ]);

  const active = projects.filter((p) => isActiveStatus(p.status));
  const upcomingDates = active
    .map((p) => p.targetGoLiveDate)
    .filter((d): d is Date => !!d)
    .map((d) => Math.ceil((d.getTime() - Date.now()) / 86_400_000));
  const daysToGoLive = upcomingDates.length > 0 ? Math.min(...upcomingDates) : null;

  return {
    activeProjects: active.length,
    blockers: activeChecks,
    daysToGoLive,
    tasksCompleted: completedTasks,
    tasksTotal: totalTasks,
  };
}

export function priorityWeight(priority: ImplementationChecklistPriority): number {
  switch (priority) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
    default:
      return 1;
  }
}

export type { GoLiveReadinessStatus };

export function listChecklistTemplates() {
  return CHECKLIST_TEMPLATES.map((tpl) => ({
    key: tpl.key,
    label: tpl.label,
    businessTypes: tpl.businessTypes,
    itemCount: tpl.items.length,
  }));
}

export function assertScope(_scope: ImplementationActorScope, _capability: string): void {
  // Reserved for future capability-based gating beyond the lib-level permission helpers.
}
