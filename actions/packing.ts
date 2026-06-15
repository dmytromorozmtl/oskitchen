"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { parsePackingDayOrNull } from "@/lib/packing/packing-dates";
import { defaultPackingModeForBusiness } from "@/lib/packing/packing-modes";
import { parsePackingCommandMode } from "@/services/packing/load-packing-page-data";
import { generatePackingQueue } from "@/services/packing/generate-packing-queue";
import { PackingTaskStatus } from "@prisma/client";

export async function generatePackingQueueAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("packing.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: session, dataUserId } = access.actor;
    const dateRaw = String(formData.get("packingDate") ?? "");
    const packingDate = parsePackingDayOrNull(dateRaw);
    if (!packingDate) return { error: "Select a valid packing date." };

    const profile = await prisma.userProfile.findUnique({
      where: { id: session.id },
      select: { kitchenSettings: { select: { businessType: true } } },
    });
    const fallback = defaultPackingModeForBusiness(profile?.kitchenSettings?.businessType ?? null);
    const rawMode = String(formData.get("mode") ?? "").trim();
    const mode = rawMode ? parsePackingCommandMode(rawMode, fallback) : fallback;

    const res = await generatePackingQueue({
      userId: dataUserId,
      packingDate,
      mode,
    });

    revalidatePath("/dashboard/packing");
    return { ok: true as const, batchId: res.batchId, tasksCreated: res.tasksCreated };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const taskStatusSchema = z.nativeEnum(PackingTaskStatus);

export async function updatePackingTaskStatusAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("packing.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: session, dataUserId } = access.actor;
    const taskId = z.string().uuid().safeParse(formData.get("taskId"));
    if (!taskId.success) return { error: "Invalid task." };

    const status = taskStatusSchema.safeParse(formData.get("status"));
    if (!status.success) return { error: "Invalid status." };

    const task = await prisma.packingTask.findFirst({
      where: { id: taskId.data, userId: dataUserId },
      include: { batch: true },
    });
    if (!task) return { error: "Task not found." };

    const now = new Date();
    const data: {
      status: PackingTaskStatus;
      packedAt?: Date | null;
      verifiedAt?: Date | null;
      labelPrintedAt?: Date | null;
    } = { status: status.data };

    if (status.data === "PACKED") {
      data.packedAt = now;
    }
    if (status.data === "VERIFIED") {
      data.verifiedAt = now;
      if (!task.packedAt) data.packedAt = now;
    }
    if (status.data === "QUEUED" || status.data === "IN_PROGRESS") {
      data.packedAt = null;
      data.verifiedAt = null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.packingTask.update({
        where: { id: task.id },
        data,
      });

      if (status.data === "VERIFIED") {
        await tx.packingVerificationEvent.create({
          data: {
            packingTaskId: task.id,
            orderId: task.orderId,
            action: "TASK_VERIFIED",
            performedById: session.id,
            metadataJson: { source: "packing_command_center" },
          },
        });
      }

      if (task.batchId) {
        const agg = await tx.packingTask.findMany({
          where: { batchId: task.batchId },
          select: { quantity: true, status: true },
        });
        const packedItems = agg
          .filter((t) => t.status === "PACKED" || t.status === "VERIFIED")
          .reduce((s, t) => s + t.quantity, 0);
        const verifiedCount = agg.filter((t) => t.status === "VERIFIED").length;
        const verificationStatus =
          agg.length > 0 && verifiedCount === agg.length
            ? "COMPLETE"
            : verifiedCount > 0 || agg.some((t) => t.status === "PACKED")
              ? "IN_PROGRESS"
              : "NOT_STARTED";

        await tx.packingBatch.update({
          where: { id: task.batchId },
          data: {
            packedItems,
            verificationStatus,
          },
        });
      }
    });

    revalidatePath("/dashboard/packing");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markLabelPrintedPlaceholderAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("packing.manage");
    if (!access.ok) return { error: access.error };
    const { dataUserId } = access.actor;
    const taskId = z.string().uuid().safeParse(formData.get("taskId"));
    if (!taskId.success) return { error: "Invalid task." };

    const task = await prisma.packingTask.findFirst({
      where: { id: taskId.data, userId: dataUserId },
    });
    if (!task) return { error: "Task not found." };

    await prisma.packingTask.update({
      where: { id: task.id },
      data: { labelPrintedAt: new Date() },
    });

    revalidatePath("/dashboard/packing");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createPackingWaveAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("packing.manage");
    if (!access.ok) return { error: access.error };
    const { dataUserId } = access.actor;
    const title = z.string().min(1).max(255).safeParse(String(formData.get("title") ?? "").trim());
    if (!title.success) return { error: "Enter a wave title." };

    const packingDate = parsePackingDayOrNull(String(formData.get("packingDate") ?? ""));
    if (!packingDate) return { error: "Select a valid packing date." };

    const ft = z.enum(["PICKUP", "DELIVERY", ""]).safeParse(String(formData.get("fulfillmentType") ?? ""));
    const fulfillmentType =
      ft.success && ft.data && (ft.data === "PICKUP" || ft.data === "DELIVERY") ? ft.data : null;

    await prisma.packingWave.create({
      data: {
        userId: dataUserId,
        title: title.data,
        packingDate,
        fulfillmentType,
        status: "ACTIVE",
      },
    });

    revalidatePath("/dashboard/packing");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
