"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { notifyPurchaseOrderApprovalRequest } from "@/services/purchasing/purchase-order-approval-service";

const poIdSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

async function loadOwnedPo(userId: string, purchaseOrderId: string) {
  return prisma.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, userId },
    include: { supplier: { select: { name: true } } },
  });
}

export async function submitPurchaseOrderForApproval(formData: FormData) {
  const { sessionUser, dataUserId } = await requireTenantActor();
  const parsed = poIdSchema.safeParse({ purchaseOrderId: formData.get("purchaseOrderId") });
  if (!parsed.success) return { error: "Invalid purchase order." };

  const po = await loadOwnedPo(dataUserId, parsed.data.purchaseOrderId);
  if (!po) return { error: "Purchase order not found." };
  if (po.status !== "DRAFT") return { error: "Only draft POs can be submitted." };

  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "READY_FOR_REVIEW" },
    }),
    prisma.purchaseApprovalEvent.create({
      data: {
        purchaseOrderId: po.id,
        action: "SUBMITTED",
        performedById: sessionUser.id,
        notes: null,
      },
    }),
  ]);

  await notifyPurchaseOrderApprovalRequest({
    userId: dataUserId,
    purchaseOrderId: po.id,
    orderNumber: po.orderNumber,
    supplierName: po.supplier.name,
    total: Number(po.total),
    actorEmail: sessionUser.email ?? null,
  });

  revalidatePath("/dashboard/purchasing");
  revalidatePath(`/dashboard/purchasing/purchase-orders/${po.id}`);
  return ok(undefined);
}

export async function approvePurchaseOrder(formData: FormData) {
  const { sessionUser, dataUserId } = await requireTenantActor();
  const parsed = poIdSchema.safeParse({
    purchaseOrderId: formData.get("purchaseOrderId"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid purchase order." };

  const po = await loadOwnedPo(dataUserId, parsed.data.purchaseOrderId);
  if (!po) return { error: "Purchase order not found." };
  if (po.status !== "READY_FOR_REVIEW") return { error: "PO is not awaiting approval." };

  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "APPROVED", approvedById: sessionUser.id },
    }),
    prisma.purchaseApprovalEvent.create({
      data: {
        purchaseOrderId: po.id,
        action: "APPROVED",
        performedById: sessionUser.id,
        notes: parsed.data.notes ?? null,
      },
    }),
  ]);

  revalidatePath("/dashboard/purchasing");
  revalidatePath(`/dashboard/purchasing/purchase-orders/${po.id}`);
  return ok(undefined);
}

export async function rejectPurchaseOrder(formData: FormData) {
  const { sessionUser, dataUserId } = await requireTenantActor();
  const parsed = poIdSchema.safeParse({
    purchaseOrderId: formData.get("purchaseOrderId"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid purchase order." };

  const po = await loadOwnedPo(dataUserId, parsed.data.purchaseOrderId);
  if (!po) return { error: "Purchase order not found." };
  if (po.status !== "READY_FOR_REVIEW") return { error: "PO is not awaiting approval." };

  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "DRAFT", approvedById: null },
    }),
    prisma.purchaseApprovalEvent.create({
      data: {
        purchaseOrderId: po.id,
        action: "REJECTED",
        performedById: sessionUser.id,
        notes: parsed.data.notes ?? null,
      },
    }),
  ]);

  revalidatePath("/dashboard/purchasing");
  revalidatePath(`/dashboard/purchasing/purchase-orders/${po.id}`);
  return ok(undefined);
}
