"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireDemoWorkspaceMutation } from "@/lib/demo/require-demo-mutation";
import { resetGoldenDemoScenario, seedGoldenDemoScenario } from "@/services/demo/demo-seed-service";
import { safeError } from "@/lib/security";

export async function seedGoldenScenarioAction(scenarioId: string) {
  try {
    const gate = await requireDemoWorkspaceMutation({ operation: "demo.seed_golden_scenario" });
    if (!gate.ok) return { error: gate.error };
    const { sessionUser: user } = gate.actor;
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
    const gate = await requireDemoWorkspaceMutation({ operation: "demo.reset_golden_scenario" });
    if (!gate.ok) return { error: gate.error };
    const { sessionUser: user } = gate.actor;
    const res = await resetGoldenDemoScenario(user.id);
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/demo/scenarios");
    revalidatePath("/dashboard/today");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
