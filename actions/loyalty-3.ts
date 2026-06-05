"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { parseLoyalty3Config } from "@/lib/loyalty/loyalty-3-settings";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { saveLoyalty3Config } from "@/services/loyalty/loyalty-3.0-service";

const configSchema = z.object({
  crossBrandEnabled: z.boolean(),
  vipMultiplier: z.number().min(1).max(3),
  vipMinLifetimeValueCents: z.number().int().min(0),
  eventBonusEnabled: z.boolean(),
  eventBonusPoints: z.number().int().min(0),
  referralLeaderboardEnabled: z.boolean(),
});

export async function saveLoyalty3ConfigAction(config: unknown) {
  try {
    const access = await requireRewardsMutation({
      required: "loyalty.manage",
      operation: "loyalty.3.save",
      module: "loyalty",
    });
    if (!access.ok) return fail(access.error);

    const parsed = configSchema.safeParse(config);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid Loyalty 3.0 config");
    }

    const { dataUserId } = await requireTenantActor();
    await saveLoyalty3Config(dataUserId, parseLoyalty3Config(parsed.data));

    revalidatePath("/dashboard/loyalty/loyalty-3");
    revalidatePath("/dashboard/customers/loyalty");
    revalidatePath("/dashboard/loyalty/program-builder");

    return ok({ message: "Loyalty 3.0 settings saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}
