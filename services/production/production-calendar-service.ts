import { parseProductionPlanTaskStatus } from "@/lib/production/production-plan-task-status";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ownerScopedAnd,
  productionPlanTaskByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function getProductionCalendar(userId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const where = await ownerScopedAnd(userId, {
    planDate: { gte: weekStart, lt: weekEnd },
  });

  return prisma.productionPlanTask.findMany({
    where,
    orderBy: [{ planDate: "asc" }, { title: "asc" }],
  });
}

/** Open and completed-through-today tasks for calendar attention strip (bounded). */
export async function getProductionCalendarOpenThroughToday(userId: string, today = new Date()) {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const where = await ownerScopedAnd(userId, {
    planDate: { lte: todayStart },
  });

  return prisma.productionPlanTask.findMany({
    where,
    orderBy: [{ planDate: "asc" }, { title: "asc" }],
    take: 50,
  });
}

export async function createProductionPlanTask(
  userId: string,
  data: {
    title: string;
    planDate: Date;
    batchSize?: number;
    recipeId?: string;
    notes?: string;
  },
) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.productionPlanTask.create({
    data: {
      userId,
      workspaceId,
      title: data.title,
      planDate: data.planDate,
      batchSize: data.batchSize ?? null,
      recipeId: data.recipeId ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function updateProductionPlanTaskDate(
  taskId: string,
  userId: string,
  planDate: Date,
) {
  const where = await productionPlanTaskByIdWhereForOwner(userId, taskId);
  const row = await prisma.productionPlanTask.findFirst({ where, select: { id: true } });
  if (!row) throw new Error("Task not found");
  return prisma.productionPlanTask.update({
    where: { id: row.id },
    data: { planDate },
  });
}

export async function updateProductionPlanTaskStatus(
  taskId: string,
  userId: string,
  status: string,
) {
  const parsed = parseProductionPlanTaskStatus(status);
  if (!parsed) throw new Error("Invalid plan task status");

  const where = await productionPlanTaskByIdWhereForOwner(userId, taskId);
  const row = await prisma.productionPlanTask.findFirst({ where, select: { id: true } });
  if (!row) throw new Error("Task not found");
  return prisma.productionPlanTask.update({
    where: { id: row.id },
    data: { status: parsed },
  });
}
