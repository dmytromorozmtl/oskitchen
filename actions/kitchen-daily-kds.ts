"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateOrderStatus } from "@/actions/orders";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export async function fetchDailyKdsOrdersAction() {
  const { dataUserId } = await requireTenantActor();
  const orders = await getDailyKdsOrders(dataUserId);
  return { ok: true as const, orders };
}

const bumpSchema = z.object({ orderId: z.string().uuid() });

export async function bumpDailyKdsOrderAction(orderId: string) {
  const parsed = bumpSchema.safeParse({ orderId });
  if (!parsed.success) return { ok: false as const, error: "Invalid order." };

  const result = await updateOrderStatus(parsed.data.orderId, "READY");
  if (!result || "error" in result) {
    return { ok: false as const, error: result?.error ?? "Could not update order." };
  }

  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard/production");
  return { ok: true as const };
}
