"use server";


import { fail, ok } from "@/lib/action-result";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { z } from "zod";

import { kitchenPermissionForWorkStatus } from "@/lib/kitchen/kitchen-work-status-permission";
import { requireKitchenMutationAccess } from "@/lib/kitchen/require-kitchen-mutation-access";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logKitchenPermissionDenied } from "@/services/kitchen/kitchen-permission-audit";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { recordAuditLog } from "@/lib/audit-log";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { generateProductionFromMenuProducts, generateProductionFromOrdersForDate } from "@/services/production/generate-production";
import type { Prisma, ProductionWorkStatus } from "@prisma/client";

export async function updateProductionTask(
  productId: string,
  patch: Partial<{ cooked: boolean; packed: boolean; labeled: boolean; assignedTo: string | null }>,
) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return { error: access.error };
  const { userId } = access.actor;

  const productWhere = await productListWhereForOwner(userId);
  const task = await prisma.productionTask.findFirst({
    where: {
      productId,
      product: productWhere,
    },
  });

  if (!task) return { error: "Task not found" };

  await prisma.productionTask.update({
    where: { id: task.id },
    data: patch,
  });

  revalidatePath("/dashboard/production");
  return ok(undefined);
}

export async function bulkProductionUpdate(
  productIds: string[],
  patch: Partial<{ cooked: boolean; packed: boolean; labeled: boolean }>,
) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return { error: access.error };
  const { userId } = access.actor;

  const productWhere = await productListWhereForOwner(userId);
  const tasks = await prisma.productionTask.findMany({
    where: {
      productId: { in: productIds },
      product: productWhere,
    },
  });

  await prisma.$transaction(
    tasks.map((t) =>
      prisma.productionTask.update({
        where: { id: t.id },
        data: patch,
      }),
    ),
  );

  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
  return ok(undefined);
}

const workStatusSchema = z.enum([
  "TO_PREP",
  "IN_PROGRESS",
  "READY",
  "HANDOFF",
  "HOLD",
  "PACK_HANDOFF",
  "DONE",
  "CANCELLED",
]);

export async function generateProductionMenuPrepFormAction(formData: FormData): Promise<void> {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return;
  const { sessionUser: user, userId } = access.actor;
  const raw = String(formData.get("productionDate") ?? "").trim();
  const d = raw ? new Date(raw) : new Date();
  const scaleRaw = Number(String(formData.get("scaleFactor") ?? "1"));
  const scaleFactor = Number.isFinite(scaleRaw) && scaleRaw >= 1 ? scaleRaw : 1;
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  await generateProductionFromMenuProducts({
    userId,
    productionDate: d,
    businessType: profile?.kitchenSettings?.businessType ?? null,
    scaleFactor,
  });
  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
  redirect(`/dashboard/production?date=${format(d, "yyyy-MM-dd")}`);
}

export async function generateProductionOrdersFormAction(formData: FormData): Promise<void> {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return;
  const { sessionUser: user, userId } = access.actor;
  const raw = String(formData.get("productionDate") ?? "").trim();
  const d = raw ? new Date(raw) : new Date();
  const scaleRaw = Number(String(formData.get("scaleFactor") ?? "1"));
  const scaleFactor = Number.isFinite(scaleRaw) && scaleRaw >= 1 ? scaleRaw : 1;
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  await generateProductionFromOrdersForDate({
    userId,
    productionDate: d,
    businessType: profile?.kitchenSettings?.businessType ?? null,
    scaleFactor,
  });
  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
  redirect(`/dashboard/production?date=${format(d, "yyyy-MM-dd")}`);
}

export async function updateProductionWorkItemStatusFormAction(formData: FormData): Promise<void> {
  const next = String(formData.get("status") ?? "").trim();
  const parsedStatus = workStatusSchema.safeParse(next);
  const requiredKitchen = parsedStatus.success
    ? kitchenPermissionForWorkStatus(parsedStatus.data as ProductionWorkStatus)
    : "kitchen.bump";
  const access = await requireKitchenMutationAccess(requiredKitchen);
  if (!access.ok) {
    await logKitchenPermissionDenied(access.actor, {
      requiredPermission: requiredKitchen,
      operation: "kitchen.update_work_item_status",
      metadata: parsedStatus.success ? { status: parsedStatus.data } : undefined,
    });
    return;
  }
  const { sessionUser: user, userId } = access.actor;
  const id = String(formData.get("workItemId") ?? "").trim();
  const appendNote = String(formData.get("appendNote") ?? "").trim();
  const parsed = parsedStatus;
  if (!id || !parsed.success) return;

  const item = await prisma.productionWorkItem.findFirst({
    where: { id, userId },
  });
  if (!item) return;

  if (item.status === parsed.data && !appendNote) return;

  const now = new Date();
  const data: Prisma.ProductionWorkItemUpdateInput = {
    status: parsed.data as ProductionWorkStatus,
  };
  if (parsed.data === "IN_PROGRESS") {
    data.startedAt = item.startedAt ?? now;
  }
  if (parsed.data === "DONE") {
    data.completedAt = now;
  }
  if (parsed.data === "TO_PREP" || parsed.data === "CANCELLED") {
    data.completedAt = null;
  }
  if (appendNote) {
    const prev = item.notes?.trim() ?? "";
    data.notes = prev ? `${prev}\n${appendNote}` : appendNote;
  }

  await prisma.productionWorkItem.update({ where: { id: item.id }, data });

  if (parsed.data === "HANDOFF") {
    await prisma.productionWorkEvent.create({
      data: {
        id: randomUUID(),
        workItemId: item.id,
        batchId: item.batchId,
        eventType: "STATION_HANDOFF",
        performedBy: user.id,
        metadataJson: { previousStatus: item.status, station: item.station },
      },
    });
  }

  if (parsed.data === "PACK_HANDOFF") {
    await prisma.productionWorkEvent.create({
      data: {
        id: randomUUID(),
        workItemId: item.id,
        batchId: item.batchId,
        eventType: "SENT_TO_PACKING",
        performedBy: user.id,
        metadataJson: { previousStatus: item.status },
      },
    });
  }

  await recordAuditLog({
    userId,
    action: "production.work_item_status",
    entityType: "ProductionWorkItem",
    entityId: item.id,
    metadata: { status: parsed.data, noteAppended: Boolean(appendNote) },
  });

  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
}

export async function assignProductionWorkItemStaffFormAction(formData: FormData): Promise<void> {
  const access = await requireKitchenMutationAccess("kitchen.expo.manage");
  if (!access.ok) {
    await logKitchenPermissionDenied(access.actor, {
      requiredPermission: "kitchen.expo.manage",
      operation: "kitchen.assign_work_item_staff",
    });
    return;
  }
  const { sessionUser: user, userId } = access.actor;
  const workItemId = String(formData.get("workItemId") ?? "").trim();
  const staffRaw = String(formData.get("staffMemberId") ?? "").trim();
  if (!workItemId) return;

  const item = await prisma.productionWorkItem.findFirst({
    where: { id: workItemId, userId },
  });
  if (!item) return;

  let staffId: string | null = staffRaw || null;
  if (staffId) {
    const sm = await prisma.staffMember.findFirst({
      where: { id: staffId, userId, active: true },
    });
    if (!sm) return;
  }

  await prisma.productionWorkItem.update({
    where: { id: item.id },
    data: { assignedToId: staffId },
  });

  await prisma.productionWorkEvent.create({
    data: {
      id: randomUUID(),
      workItemId: item.id,
      batchId: item.batchId,
      eventType: "REASSIGNED",
      performedBy: user.id,
      metadataJson: { staffMemberId: staffId },
    },
  });

  await recordAuditLog({
    userId,
    action: "production.work_item_assign",
    entityType: "ProductionWorkItem",
    entityId: item.id,
    metadata: { staffMemberId: staffId },
  });

  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
}

export async function handoffProductionWorkItemFormAction(formData: FormData): Promise<void> {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) return;
  const { sessionUser: user, userId } = access.actor;
  const workItemId = String(formData.get("workItemId") ?? "").trim();
  const toStation = String(formData.get("toStation") ?? "").trim();
  if (!workItemId || !toStation) return;

  const item = await prisma.productionWorkItem.findFirst({
    where: { id: workItemId, userId },
  });
  if (!item) return;

  await prisma.productionWorkItem.update({
    where: { id: item.id },
    data: {
      status: "HANDOFF",
      station: toStation,
      notes: item.notes ? `${item.notes}\nHandoff → ${toStation}` : `Handoff → ${toStation}`,
    },
  });

  await prisma.productionWorkEvent.create({
    data: {
      id: randomUUID(),
      workItemId: item.id,
      batchId: item.batchId,
      eventType: "STATION_HANDOFF",
      performedBy: user.id,
      metadataJson: { fromStation: item.station, toStation },
    },
  });

  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/kitchen");
}
