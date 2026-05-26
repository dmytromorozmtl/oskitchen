"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  getAIMenuSuggestions,
  getAIOrderForecast,
  getAIWhatToOrder,
} from "@/services/ai/kitchen-ai-service";

const forecastDaysSchema = z.coerce.number().int().min(1).max(30).default(7);

export async function runAIOrderForecastAction(days = 7) {
  const parsed = forecastDaysSchema.safeParse(days);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid forecast range (1–30 days)" };
  }
  const { dataUserId } = await requireTenantActor();
  const result = await getAIOrderForecast(dataUserId, parsed.data);
  return { ok: true as const, result };
}

export async function runAIMenuSuggestionsAction() {
  const { dataUserId } = await requireTenantActor();
  const result = await getAIMenuSuggestions(dataUserId);
  return { ok: true as const, result };
}

export async function runAIWhatToOrderAction() {
  const { dataUserId } = await requireTenantActor();
  const result = await getAIWhatToOrder(dataUserId);
  return { ok: true as const, result };
}
