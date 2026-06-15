import { Prisma } from "@prisma/client";
import type {
  BusinessType,
  PlaybookRunStepStatus,
  PlaybookStatus,
} from "@prisma/client";

import { isTerminalRunStatus, isTerminalStepStatus } from "@/lib/playbooks/playbook-status";
import { SYSTEM_PLAYBOOK_TEMPLATES } from "@/lib/playbooks/playbook-templates";
import type { PlaybookTemplateSeed } from "@/lib/playbooks/playbook-types";
import { prisma } from "@/lib/prisma";
import {
  playbookEventListWhereForOwner,
  playbookRunByIdWhereForOwner,
  playbookRunListWhereForOwner,
} from "@/lib/scope/workspace-accounting-scope";
import { kitchenTaskListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  playbookByIdOrSlugWhereForOwner,
  playbookByIdWhereForOwner,
  playbookListWhereForOwner,
} from "@/lib/scope/workspace-training-scope";

type Scope = { userId: string; email: string | null };

/**
 * Idempotently make sure all system templates exist for the workspace.
 * We keep one row per (userId, slug) so each workspace can customise
 * its own copy. The templates themselves never get destructive
 * updates — only `description`, `recommendedModules`, default roles,
 * and trigger metadata are refreshed.
 */
export async function ensureSystemPlaybooks(scope: Scope): Promise<void> {
  const playbookScope = await playbookListWhereForOwner(scope.userId);
  const slugs = SYSTEM_PLAYBOOK_TEMPLATES.map((seed) => seed.slug);
  const existingRows = await prisma.playbook.findMany({
    where: {
      AND: [playbookScope, { slug: { in: slugs }, systemTemplate: true }],
    },
    select: { id: true, slug: true },
  });
  const existingBySlug = new Map(
    existingRows.flatMap((row) => (row.slug ? ([[row.slug, row.id]] as const) : [])),
  );

  await Promise.all(
    SYSTEM_PLAYBOOK_TEMPLATES.map(async (seed) => {
      const existingId = existingBySlug.get(seed.slug);
      if (existingId) {
        await prisma.playbook.update({
          where: { id: existingId },
          data: {
            title: seed.title,
            description: seed.description,
            type: seed.type,
            businessModesJson: seed.businessModes as Prisma.InputJsonValue,
            recommendedModulesJson: seed.recommendedModules as Prisma.InputJsonValue,
            defaultRolesJson: seed.defaultRoles as Prisma.InputJsonValue,
            triggerType: seed.triggerType,
            recurrenceRule: seed.recurrenceRule ?? null,
          },
        });
        return;
      }
      await createPlaybookFromSeed(scope, seed, { systemTemplate: true });
    }),
  );
}

export async function createPlaybookFromSeed(
  scope: Scope,
  seed: PlaybookTemplateSeed,
  opts: { systemTemplate?: boolean } = {},
): Promise<{ id: string }> {
  const playbook = await prisma.$transaction(async (tx) => {
    const row = await tx.playbook.create({
      data: {
        userId: scope.userId,
        title: seed.title,
        slug: seed.slug,
        description: seed.description,
        type: seed.type,
        businessModesJson: seed.businessModes as Prisma.InputJsonValue,
        recommendedModulesJson: seed.recommendedModules as Prisma.InputJsonValue,
        defaultRolesJson: seed.defaultRoles as Prisma.InputJsonValue,
        triggerType: seed.triggerType,
        recurrenceRule: seed.recurrenceRule ?? null,
        systemTemplate: opts.systemTemplate ?? false,
        active: true,
        status: "READY",
        steps: {
          create: seed.steps.map((s, idx) => ({
            title: s.title,
            description: s.description ?? null,
            sortOrder: idx,
            recommendedRole: s.recommendedRole ?? null,
            moduleKey: s.moduleKey ?? null,
            actionRoute: s.actionRoute ?? null,
            estimatedMinutes: s.estimatedMinutes ?? null,
            required: s.required ?? true,
            checklistJson: (s.checklist ?? []) as Prisma.InputJsonValue,
            taskTemplateJson: (s.taskTemplate ?? {}) as Prisma.InputJsonValue,
          })),
        },
      },
      select: { id: true },
    });
    await tx.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType: "playbook_created",
        performedBy: scope.email ?? "user",
        playbookId: row.id,
        metadataJson: {
          playbookId: row.id,
          systemTemplate: !!opts.systemTemplate,
        } as Prisma.InputJsonValue,
      },
    });
    return row;
  });
  return playbook;
}

export type ListPlaybooksFilter = {
  systemOnly?: boolean;
  customOnly?: boolean;
  businessMode?: BusinessType | null;
  activeOnly?: boolean;
};

export async function listPlaybooks(scope: Scope, filter: ListPlaybooksFilter = {}) {
  const playbookScope = await playbookListWhereForOwner(scope.userId);
  const rows = await prisma.playbook.findMany({
    where: {
      AND: [
        playbookScope,
        ...(filter.activeOnly !== false ? [{ active: true }] : []),
        ...(filter.systemOnly ? [{ systemTemplate: true }] : []),
        ...(filter.customOnly ? [{ systemTemplate: false }] : []),
      ],
    },
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      _count: { select: { runs: true } },
    },
    orderBy: [{ systemTemplate: "desc" }, { title: "asc" }],
  });
  if (!filter.businessMode) return rows;
  return rows.filter((r) => {
    const modes = (r.businessModesJson as string[] | null) ?? [];
    return modes.includes(filter.businessMode!);
  });
}

export async function getPlaybook(scope: Scope, idOrSlug: string) {
  return playbookByIdOrSlugWhereForOwner(scope.userId, idOrSlug).then((where) =>
    prisma.playbook.findFirst({
      where,
      include: {
        steps: { orderBy: { sortOrder: "asc" } },
        runs: {
          orderBy: { startedAt: "desc" },
          take: 10,
          include: { _count: { select: { steps: true } } },
        },
      },
    }),
  );
}

export async function recommendedPlaybooksForMode(
  scope: Scope,
  mode: BusinessType | null,
  limit = 4,
) {
  const all = await listPlaybooks(scope, { activeOnly: true });
  if (!mode) return all.filter((r) => r.systemTemplate).slice(0, limit);
  return all
    .filter((r) => ((r.businessModesJson as string[] | null) ?? []).includes(mode))
    .slice(0, limit);
}

export type StartRunInput = {
  playbookId: string;
  brandId?: string | null;
  locationId?: string | null;
  dueAt?: Date | null;
  title?: string | null;
  businessMode?: BusinessType | null;
  generateTasks?: boolean;
  assignedRoleByStep?: Record<string, string | null>;
};

export async function startPlaybookRun(scope: Scope, input: StartRunInput) {
  const playbook = await playbookByIdWhereForOwner(scope.userId, input.playbookId).then((playbookWhere) =>
    prisma.playbook.findFirst({
      where: playbookWhere,
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    }),
  );
  if (!playbook) throw new Error("Playbook not found");

  const run = await prisma.$transaction(async (tx) => {
    const row = await tx.playbookRun.create({
      data: {
        playbookId: playbook.id,
        userId: scope.userId,
        brandId: input.brandId ?? null,
        locationId: input.locationId ?? null,
        title: input.title ?? playbook.title,
        status: "RUNNING",
        businessMode: input.businessMode ?? null,
        startedBy: scope.email ?? "user",
        dueAt: input.dueAt ?? null,
        steps: {
          create: playbook.steps.map((step) => ({
            stepId: step.id,
            status: "NOT_STARTED",
            assignedRole:
              input.assignedRoleByStep?.[step.id] ?? step.recommendedRole ?? null,
          })),
        },
      },
      select: { id: true },
    });
    await tx.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType: "run_started",
        performedBy: scope.email ?? "user",
        playbookId: playbook.id,
        runId: row.id,
        metadataJson: { playbookId: playbook.id, runId: row.id } as Prisma.InputJsonValue,
      },
    });
    return row;
  });
  if (input.generateTasks) {
    const { generateTasksForRun } = await import("./playbook-task-generator");
    await generateTasksForRun(scope, run.id);
  }
  return run;
}

export async function listRuns(
  scope: Scope,
  opts: { statuses?: PlaybookStatus[]; limit?: number } = {},
) {
  const runScope = await playbookRunListWhereForOwner(scope.userId);
  return prisma.playbookRun.findMany({
    where: {
      AND: [
        runScope,
        ...(opts.statuses && opts.statuses.length ? [{ status: { in: opts.statuses } }] : []),
      ],
    },
    include: {
      playbook: { select: { id: true, title: true, type: true, slug: true } },
      _count: { select: { steps: true } },
      steps: { select: { status: true } },
    },
    orderBy: { startedAt: "desc" },
    take: opts.limit ?? 50,
  });
}

export async function getRun(scope: Scope, runId: string) {
  return playbookRunByIdWhereForOwner(scope.userId, runId).then((where) =>
    prisma.playbookRun.findFirst({
      where,
      include: {
        playbook: {
          include: { steps: { orderBy: { sortOrder: "asc" } } },
        },
        steps: {
          include: { step: true, task: { select: { id: true, status: true, title: true } } },
        },
        brand: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    }),
  );
}

export async function transitionRunStep(
  scope: Scope,
  runStepId: string,
  next: PlaybookRunStepStatus,
  patch: { blockedReason?: string | null; notes?: string | null } = {},
) {
  const runScope = await playbookRunListWhereForOwner(scope.userId);
  const runStep = await prisma.playbookRunStep.findFirst({
    where: { id: runStepId, run: runScope },
    select: { id: true, runId: true, status: true, stepId: true },
  });
  if (!runStep) throw new Error("Run step not found");
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.playbookRunStep.update({
      where: { id: runStepId },
      data: {
        status: next,
        startedAt: next === "IN_PROGRESS" && !runStep.status ? now : undefined,
        completedAt: isTerminalStepStatus(next) ? now : null,
        blockedReason: next === "BLOCKED" ? patch.blockedReason ?? null : null,
        notes: patch.notes ?? null,
      },
    });
    await tx.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType: `step_${next.toLowerCase()}`,
        performedBy: scope.email ?? "user",
        runId: runStep.runId,
        stepId: runStep.stepId,
        metadataJson: { runId: runStep.runId, stepId: runStep.stepId } as Prisma.InputJsonValue,
      },
    });
  });
  await maybeAutoTransitionRun(scope, runStep.runId);
}

async function maybeAutoTransitionRun(scope: Scope, runId: string) {
  const steps = await prisma.playbookRunStep.findMany({
    where: { runId },
    select: { status: true, step: { select: { required: true } } },
  });
  if (steps.length === 0) return;
  const anyBlocked = steps.some((s) => s.status === "BLOCKED");
  const allDone = steps.every(
    (s) => s.status === "COMPLETED" || s.status === "SKIPPED" || !s.step.required,
  );
  const requiredDone = steps
    .filter((s) => s.step.required)
    .every((s) => s.status === "COMPLETED" || s.status === "SKIPPED");
  let next: PlaybookStatus | null = null;
  if (anyBlocked) next = "BLOCKED";
  else if (allDone && requiredDone) next = "COMPLETED";
  else next = "RUNNING";
  await prisma.$transaction(async (tx) => {
    await tx.playbookRun.update({
      where: { id: runId },
      data: {
        status: next,
        completedAt: next === "COMPLETED" ? new Date() : null,
      },
    });
    if (next === "COMPLETED") {
      await tx.playbookEvent.create({
        data: {
          userId: scope.userId,
          eventType: "run_completed",
          performedBy: scope.email ?? "user",
          runId,
          metadataJson: { runId } as Prisma.InputJsonValue,
        },
      });
    } else if (next === "BLOCKED") {
      await tx.playbookEvent.create({
        data: {
          userId: scope.userId,
          eventType: "run_blocked",
          performedBy: scope.email ?? "user",
          runId,
          metadataJson: { runId } as Prisma.InputJsonValue,
        },
      });
    }
  });
}

export async function completeRun(scope: Scope, runId: string) {
  const run = await playbookRunByIdWhereForOwner(scope.userId, runId).then((where) =>
    prisma.playbookRun.findFirst({
      where,
      select: { id: true, status: true },
    }),
  );
  if (!run) throw new Error("Run not found");
  if (isTerminalRunStatus(run.status)) return;
  await prisma.$transaction(async (tx) => {
    await tx.playbookRun.update({
      where: { id: runId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await tx.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType: "run_completed",
        performedBy: scope.email ?? "user",
        runId,
        metadataJson: { runId } as Prisma.InputJsonValue,
      },
    });
  });
}

export async function cancelRun(scope: Scope, runId: string, reason?: string) {
  const run = await playbookRunByIdWhereForOwner(scope.userId, runId).then((where) =>
    prisma.playbookRun.findFirst({
      where,
      select: { id: true },
    }),
  );
  if (!run) return;
  await prisma.$transaction(async (tx) => {
    await tx.playbookRun.update({
      where: { id: runId },
      data: { status: "CANCELLED", completedAt: new Date(), notes: reason ?? null },
    });
    await tx.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType: "run_cancelled",
        performedBy: scope.email ?? "user",
        runId,
        metadataJson: { runId, reason: reason ?? null } as Prisma.InputJsonValue,
      },
    });
  });
}

export async function archivePlaybook(scope: Scope, playbookId: string) {
  const where = await playbookByIdWhereForOwner(scope.userId, playbookId);
  await prisma.playbook.updateMany({
    where: { AND: [where, { systemTemplate: false }] },
    data: { active: false, status: "ARCHIVED" },
  });
  await recordPlaybookEvent(scope, "playbook_archived", { playbookId });
}

export async function recordPlaybookEvent(
  scope: Scope,
  eventType: string,
  metadata: { playbookId?: string; runId?: string; stepId?: string; [k: string]: unknown },
): Promise<void> {
  try {
    await prisma.playbookEvent.create({
      data: {
        userId: scope.userId,
        eventType,
        performedBy: scope.email ?? "user",
        playbookId: metadata.playbookId ?? null,
        runId: metadata.runId ?? null,
        stepId: metadata.stepId ?? null,
        metadataJson: metadata as Prisma.InputJsonValue,
      },
    });
  } catch {
    // never block on audit writes
  }
}

export async function listRecentEvents(scope: Scope, limit = 100) {
  const eventScope = await playbookEventListWhereForOwner(scope.userId);
  return prisma.playbookEvent.findMany({
    where: eventScope,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getPlaybookKpis(scope: Scope) {
  const [runScope, playbookScope, taskScope] = await Promise.all([
    playbookRunListWhereForOwner(scope.userId),
    playbookListWhereForOwner(scope.userId),
    kitchenTaskListWhereForOwner(scope.userId),
  ]);
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const now = new Date();

  const [active, completedToday, blockedSteps, overdueRuns, templates, tasksGenerated] = await Promise.all([
    prisma.playbookRun.count({
      where: { AND: [runScope, { status: { in: ["RUNNING", "BLOCKED"] } }] },
    }),
    prisma.playbookRun.count({
      where: {
        AND: [runScope, { status: "COMPLETED", completedAt: { gte: dayStart } }],
      },
    }),
    prisma.playbookRunStep.count({
      where: { run: runScope, status: "BLOCKED" },
    }),
    prisma.playbookRun.count({
      where: {
        AND: [runScope, { status: { in: ["RUNNING", "BLOCKED"] }, dueAt: { lt: now } }],
      },
    }),
    prisma.playbook.count({
      where: { AND: [playbookScope, { active: true, systemTemplate: true }] },
    }),
    prisma.kitchenTask.count({
      where: { AND: [taskScope, { sourceType: "PLAYBOOK" }] },
    }),
  ]);
  return { active, completedToday, blockedSteps, overdueRuns, templates, tasksGenerated };
}
