"use server";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  answerKitchenInventoryQuery,
  parseKitchenVoiceUtterance,
} from "@/services/voice/kitchen-voice-service";

export async function tryKitchenVoiceQueryAction(utterance: string) {
  try {
    const { dataUserId } = await requireTenantActor();
    const parsed = parseKitchenVoiceUtterance(utterance);
    const result = await answerKitchenInventoryQuery(dataUserId, parsed);
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}
