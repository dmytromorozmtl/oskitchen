"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { requireKitchenAiActor } from "@/lib/ai/require-kitchen-ai-actor";
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
  const access = await requireKitchenAiActor({
    capability: "copilot.read.financial",
    operation: "kitchen_ai.order_forecast",
  });
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }
  const result = await getAIOrderForecast(access.dataUserId, parsed.data);
  return { ok: true as const, result };
}

export async function runAIMenuSuggestionsAction() {
  const access = await requireKitchenAiActor({
    capability: "copilot.read.financial",
    operation: "kitchen_ai.menu_suggestions",
  });
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }
  const result = await getAIMenuSuggestions(access.dataUserId);
  return { ok: true as const, result };
}

export async function runAIWhatToOrderAction() {
  const access = await requireKitchenAiActor({
    capability: "copilot.read.operations",
    operation: "kitchen_ai.what_to_order",
  });
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }
  const result = await getAIWhatToOrder(access.dataUserId);
  return { ok: true as const, result };
}
