"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { toggleKdsStationRoutingRule } from "@/lib/kitchen/kds-station-routing-rules-storage";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";

const toggleSchema = z.object({
  ruleId: z.string().min(1),
  enabled: z.enum(["true", "false"]),
});

function revalidateRoutingRules() {
  revalidatePath("/dashboard/kitchen/routing-rules");
  revalidatePath("/dashboard/kitchen/production");
  revalidatePath("/dashboard/kitchen");
}

export async function toggleKdsRoutingRuleAction(formData: FormData) {
  const access = await requireMutationPermission("kitchen.configure");
  if (!access.ok) return fail(access.error);

  const parsed = toggleSchema.safeParse({
    ruleId: formData.get("ruleId"),
    enabled: formData.get("enabled"),
  });
  if (!parsed.success) return fail("Invalid rule toggle.");

  await toggleKdsStationRoutingRule(
    access.actor.userId,
    parsed.data.ruleId,
    parsed.data.enabled === "true",
  );
  revalidateRoutingRules();
  return ok({ ruleId: parsed.data.ruleId });
}
