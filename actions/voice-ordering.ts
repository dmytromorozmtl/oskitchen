"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  loadVoiceSettings,
  parseVoiceOrder,
  processVoiceOrder,
  saveVoiceSettings,
} from "@/services/voice/voice-ordering-service";

export async function saveVoiceSettingsAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const enabled = formData.get("enabled") === "on";
    const alexaEnabled = formData.get("alexaEnabled") === "on";
    const googleEnabled = formData.get("googleEnabled") === "on";
    const wakePhrase = String(formData.get("wakePhrase") ?? "").trim();

    const next = await saveVoiceSettings(dataUserId, {
      enabled,
      alexaEnabled,
      googleEnabled,
      wakePhrase: wakePhrase || undefined,
    });

    revalidatePath("/dashboard/settings/voice");
    return ok({ settings: next });
  } catch (e) {
    return fail(safeError(e));
  }
}

const utteranceSchema = z.object({
  utterance: z.string().min(3).max(500),
});

export async function testVoiceParseAction(formData: FormData) {
  try {
    const { dataUserId } = await requireTenantActor();
    const parsed = utteranceSchema.safeParse({
      utterance: String(formData.get("utterance") ?? ""),
    });
    if (!parsed.success) return fail("Enter a voice command to test.");

    const result = await parseVoiceOrder(dataUserId, { utterance: parsed.data.utterance });
    if ("error" in result) return fail(result.error);
    return ok({ parsed: result });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function processVoiceOrderTestAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const parsed = utteranceSchema.safeParse({
      utterance: String(formData.get("utterance") ?? ""),
    });
    if (!parsed.success) return fail("Enter a voice command.");

    const result = await processVoiceOrder({
      ownerUserId: dataUserId,
      channel: "dashboard_test",
      utterance: parsed.data.utterance,
    });

    if (!result.ok) return fail(result.error);
    revalidatePath("/dashboard/kitchen");
    return ok({ orderId: result.orderId, speech: result.speech });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadVoiceSettingsForDashboard() {
  const { dataUserId } = await requireTenantActor();
  return loadVoiceSettings(dataUserId);
}
