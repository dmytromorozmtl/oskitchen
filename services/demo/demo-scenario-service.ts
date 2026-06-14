import { GOLDEN_DEMO_SCENARIOS, getGoldenDemoScenario } from "@/lib/demo/golden-demo-scenarios";
import type { DemoSeedPlan } from "@/lib/demo/demo-data-contract";

export function listGoldenDemoScenarioPlans(): DemoSeedPlan[] {
  return GOLDEN_DEMO_SCENARIOS;
}

export function getDemoScenarioPlan(scenarioId: string): DemoSeedPlan | null {
  return getGoldenDemoScenario(scenarioId);
}
