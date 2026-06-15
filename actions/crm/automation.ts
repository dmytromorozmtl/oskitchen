"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { parseCrmAutomationConfig } from "@/lib/crm/automation-settings";
import { requireCrmMutation } from "@/lib/crm/require-crm-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  runCrmAutomationScan,
  saveCrmAutomationConfig,
} from "@/services/crm/automation-service";

const configSchema = z.object({
  winBackEnabled: z.boolean(),
  winBackInactiveDays: z.number().int().min(7),
  birthdayEnabled: z.boolean(),
  favoritesEnabled: z.boolean(),
  favoritesInactiveDays: z.number().int().min(7),
  requireMarketingConsent: z.boolean(),
});

export async function saveCrmAutomationConfigAction(config: unknown) {
  try {
    const access = await requireCrmMutation("crm.automation.save");
    if (!access.ok) return fail(access.error);

    const parsed = configSchema.safeParse(config);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid automation config");
    }

    const { dataUserId } = await requireTenantActor();
    await saveCrmAutomationConfig(dataUserId, parseCrmAutomationConfig(parsed.data));

    revalidatePath("/dashboard/crm/automation");
    revalidatePath("/dashboard/customers/follow-ups");

    return ok({ message: "CRM automation settings saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function runCrmAutomationScanAction() {
  try {
    const access = await requireCrmMutation("crm.automation.scan");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await runCrmAutomationScan(dataUserId);

    revalidatePath("/dashboard/crm/automation");
    revalidatePath("/dashboard/customers/follow-ups");

    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}
