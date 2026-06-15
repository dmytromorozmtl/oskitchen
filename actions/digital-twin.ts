"use server";

import type { SimulationMenuMixItem } from "@/lib/ai/digital-twin-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { runKitchenSimulation } from "@/services/ai/digital-twin";

export async function runDigitalTwinScenarioAction(input: {
  orderCount: number;
  timeWindow: number;
  menuMix: SimulationMenuMixItem[];
}) {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    throw new Error("Workspace not found.");
  }

  const orderCount = Math.min(500, Math.max(50, Math.round(input.orderCount)));
  const timeWindow = [30, 60, 120, 240].includes(input.timeWindow) ? input.timeWindow : 60;

  return runKitchenSimulation(workspaceId, {
    orderCount,
    timeWindow,
    menuMix: input.menuMix,
  });
}
