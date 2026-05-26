"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { resetGoldenDemoScenario, seedGoldenDemoScenario } from "@/services/demo/demo-seed-service";
import { safeError } from "@/lib/security";

export async function seedGoldenScenarioAction(scenarioId: string) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const res = await seedGoldenDemoScenario(user.id, scenarioId);
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/demo/scenarios");
    revalidatePath("/dashboard/today");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function resetGoldenScenarioAction() {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const res = await resetGoldenDemoScenario(user.id);
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/demo/scenarios");
    revalidatePath("/dashboard/today");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
