"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateOrderStatus } from "@/actions/orders";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import {
  logKitchenOrderBumped,
  logKitchenOrderRecalled,
  logKitchenPermissionDenied,
} from "@/services/kitchen/kitchen-permission-audit";

type KitchenMutationPermission = Extract<
  PermissionKey,
  "kitchen.view" | "kitchen.bump" | "kitchen.recall"
>;

async function requireKitchenPermission(
  required: KitchenMutationPermission,
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

const orderIdSchema = z.object({ orderId: z.string().uuid() });

export async function bumpDailyKdsOrderAction(orderId: string) {
  const parsed = orderIdSchema.safeParse({ orderId });
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

export async function recallDailyKdsOrderAction(orderId: string) {
  const parsed = orderIdSchema.safeParse({ orderId });
  if (!parsed.success) return { ok: false as const, error: "Invalid order." };

  const access = await requireKitchenPermission("kitchen.recall", "kitchen.recall_order", {
    orderId: parsed.data.orderId,
  });
  if (!access.ok) return { ok: false as const, error: access.error };

  const result = await updateOrderStatus(parsed.data.orderId, "PREPARING", {
    requiredPermission: "kitchen.recall",
  });
  if (!result || "error" in result) {
    return { ok: false as const, error: result?.error ?? "Could not recall order." };
  }

  await logKitchenOrderRecalled(access.actor, { orderId: parsed.data.orderId });

  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard/production");
  return { ok: true as const };
}
