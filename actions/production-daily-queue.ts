"use server";


import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getTodayQueue } from "@/services/production/daily-queue-service";

export async function fetchTodayQueueAction() {
  const { userId } = await requireTenantActor();
  const orders = await getTodayQueue(userId);
  return { ok: true as const, orders };
}
