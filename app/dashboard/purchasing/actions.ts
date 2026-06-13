"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createDraftPurchaseOrdersFromReorderQueue,
  syncReorderQueueFromBelowParLevels,
} from "@/services/inventory/par-levels-auto-reorder-service";
import { nextPurchaseOrderNumber, seedReorderQueueFromDemandShortages } from "@/services/purchasing/purchasing-service";

export async function seedReorderFromDemandAction() {
  const user = await requireSessionUser();
  await seedReorderQueueFromDemandShortages(user.id);
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/purchasing/reorder-queue");
}

export async function syncParLevelsToReorderQueueAction() {
  const user = await requireSessionUser();
  await syncReorderQueueFromBelowParLevels(user.id);
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/purchasing/reorder-queue");
}

export async function createDraftPosFromReorderQueueAction() {
  const user = await requireSessionUser();
  const result = await createDraftPurchaseOrdersFromReorderQueue(user.id);
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/purchasing/reorder-queue");
  revalidatePath("/dashboard/purchasing/purchase-orders");
  if (result.poIds.length === 1) {
    redirect(`/dashboard/purchasing/purchase-orders/${result.poIds[0]}`);
  }
  redirect("/dashboard/purchasing/purchase-orders");
}

export async function createSupplierAction(formData: FormData) {
  const user = await requireSessionUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.supplier.create({
    data: {
      userId: user.id,
      name,
      contactName: String(formData.get("contactName") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      active: true,
    },
  });
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/purchasing/suppliers");
}

export async function createDraftPurchaseOrderAction(formData: FormData) {
  const user = await requireSessionUser();
  const supplierId = String(formData.get("supplierId") ?? "").trim();
  if (!supplierId) redirect("/dashboard/purchasing/suppliers");

  const sup = await prisma.supplier.findFirst({
    where: { id: supplierId, userId: user.id, active: true },
  });
  if (!sup) redirect("/dashboard/purchasing/suppliers");

  const orderNumber = await nextPurchaseOrderNumber(user.id);
  const po = await prisma.purchaseOrder.create({
    data: {
      userId: user.id,
      supplierId: sup.id,
      orderNumber,
      status: "DRAFT",
      sourceType: "MANUAL",
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      createdById: user.id,
    },
  });
  await prisma.purchaseApprovalEvent.create({
    data: {
      purchaseOrderId: po.id,
      action: "CREATED_DRAFT",
      performedById: user.id,
    },
  });
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/purchasing/purchase-orders");
  redirect(`/dashboard/purchasing/purchase-orders/${po.id}`);
}
