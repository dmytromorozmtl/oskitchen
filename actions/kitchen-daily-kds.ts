"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateOrderStatus } from "@/actions/orders";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import {
  logKitchenOrderBumped,
  logKitchenPermissionDenied,
} from "@/services/kitchen/kitchen-permission-audit";

async function requireKitchenPermission(
  required: "kitchen.view" | "kitchen.bump",
  operation: string,
  metadata?: Record<string, unknown>,
) {
  const access = await requireMutationPermission(required);
  if (!access.ok) {
    await logKitchenPermissionDenied(access.actor, {
      requiredPermission: required,
      operation,
      metadata,
    });
  }
  return access;
}

export async function fetchDailyKdsOrdersAction() {
  const access = await requireKitchenPermission("kitchen.view", "kitchen.fetch_daily_orders");
  if (!access.ok) return { ok: false as const, error: access.error };

  const orders = await getDailyKdsOrders(access.actor.userId);
  return { ok: true as const, orders };
}

const bumpSchema = z.object({ orderId: z.string().uuid() });

export async function bumpDailyKdsOrderAction(orderId: string) {
  const parsed = bumpSchema.safeParse({ orderId });
  if (!parsed.success) return { ok: false as const, error: "Invalid order." };

  const access = await requireKitchenPermission("kitchen.bump", "kitchen.bump_order", {
    orderId: parsed.data.orderId,
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const result = await updateOrderStatus(parsed.data.orderId, "READY", {
    requiredPermission: "kitchen.bump",
  });
  if (!result || "error" in result) {
    return { ok: false as const, error: result?.error ?? "Could not update order." };
  }

  await logKitchenOrderBumped(access.actor, { orderId: parsed.data.orderId });

  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard/production");
  return { ok: true as const };
}
