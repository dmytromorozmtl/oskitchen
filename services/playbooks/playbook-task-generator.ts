import { Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";

import { prisma } from "@/lib/prisma";
import { recordPlaybookEvent } from "./playbook-service";

type Scope = { userId: string; email: string | null };

type TaskTemplate = {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedMinutes?: number;
};

/**
 * Idempotently generate kitchen tasks for every required run step
 * that doesn't already have one. Returns `created` count.
 *
 * Safety:
 *  - Run must belong to the caller (`userId` scoped).
 *  - We will NEVER re-create a task for a run step that already has
 *    one (`taskId IS NOT NULL`).
 *  - We set `sourceType = PLAYBOOK` and `sourceId = runStepId` so
 *    every generated task is traceable.
 */
export async function generateTasksForRun(scope: Scope, runId: string): Promise<{ created: number }> {
  const run = await prisma.playbookRun.findFirst({
    where: { id: runId, userId: scope.userId },
    include: {
      playbook: { select: { title: true } },
      steps: {
        where: { taskId: null, status: { not: "SKIPPED" } },
        include: { step: true },
      },
    },
  });
  if (!run) throw new Error("Run not found");

  let created = 0;
  for (const rs of run.steps) {
    if (!rs.step.required) continue;
    const template = (rs.step.taskTemplateJson as TaskTemplate | null) ?? {};
    const baseDue = run.dueAt ?? new Date();
    const dueAt = rs.step.estimatedMinutes
      ? addMinutes(baseDue, rs.step.estimatedMinutes)
      : baseDue;
    const checklist = Array.isArray(rs.step.checklistJson)
      ? (rs.step.checklistJson as unknown[]).map((x) => String(x))
      : [];

    const task = await prisma.kitchenTask.create({
      data: {
        userId: scope.userId,
        title: template.title ?? rs.step.title,
        description:
          template.description ??
          `From playbook ${run.playbook.title}: ${rs.step.title}${
            rs.step.description ? `\n\n${rs.step.description}` : ""
          }`,
        taskType: "ADMIN",
        priority: template.priority ?? "MEDIUM",
        status: "OPEN",
        sourceType: "PLAYBOOK",
        sourceId: rs.id,
        sourceLabel: `Playbook: ${run.playbook.title}`,
        assignedRole: rs.assignedRole ?? null,
        assignedToId: rs.assignedToId ?? null,
        brandId: run.brandId ?? null,
        locationId: run.locationId ?? null,
        dueAt,
        estimatedMinutes: template.estimatedMinutes ?? rs.step.estimatedMinutes ?? null,
        checklistJson: checklist as Prisma.InputJsonValue,
        metadataJson: {
          playbookRunId: run.id,
          playbookStepId: rs.step.id,
          moduleKey: rs.step.moduleKey,
          actionRoute: rs.step.actionRoute,
        } as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    await prisma.playbookRunStep.update({
      where: { id: rs.id },
      data: { taskId: task.id },
    });
    created++;
  }

  await prisma.playbookRun.update({
    where: { id: run.id },
    data: { tasksGenerated: true },
  });

  await recordPlaybookEvent(scope, "tasks_generated", { runId: run.id, created });
  return { created };
}

/**
 * Lightweight preview (no DB writes) of what would be created if
 * the user clicks "Generate tasks".
 */
export async function previewTasksForRun(
  scope: Scope,
  runId: string,
): Promise<
  Array<{
    runStepId: string;
    title: string;
    role: string | null;
    moduleKey: string | null;
    estimatedMinutes: number | null;
    skipped: boolean;
    reason?: string;
  }>
> {
  const run = await prisma.playbookRun.findFirst({
    where: { id: runId, userId: scope.userId },
    include: { steps: { include: { step: true } } },
  });
  if (!run) return [];
  return run.steps.map((rs) => {
    const has = rs.taskId !== null;
    const skipped = !rs.step.required || has || rs.status === "SKIPPED";
    return {
      runStepId: rs.id,
      title: rs.step.title,
      role: rs.assignedRole ?? rs.step.recommendedRole ?? null,
      moduleKey: rs.step.moduleKey ?? null,
      estimatedMinutes: rs.step.estimatedMinutes ?? null,
      skipped,
      reason: has
        ? "Already linked to a task"
        : !rs.step.required
          ? "Optional step"
          : rs.status === "SKIPPED"
            ? "Step skipped"
            : undefined,
    };
  });
}
