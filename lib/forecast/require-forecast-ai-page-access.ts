import { requireKitchenAiActor } from "@/lib/ai/require-kitchen-ai-actor";

export async function requireForecastAiPageAccess(): Promise<
  { ok: true; dataUserId: string } | { ok: false; error: string }
> {
  return requireKitchenAiActor({
    capability: "copilot.read.financial",
    operation: "kitchen_ai.order_forecast_page",
  });
}
