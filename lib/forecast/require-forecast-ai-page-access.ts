import { requireKitchenAiActor } from "@/lib/ai/require-kitchen-ai-actor";

/** Server page gate for `/dashboard/forecast/ai` — mirrors `runAIOrderForecastAction`. */
export async function requireForecastAiPageAccess() {
  return requireKitchenAiActor({
    capability: "copilot.read.financial",
    operation: "kitchen_ai.order_forecast_page",
  });
}
