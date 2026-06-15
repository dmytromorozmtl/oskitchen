import type { GoldenDemoScenarioId } from "@/lib/demo/demo-data-contract";
import type { DemoSeedRecordKind } from "@/lib/demo/demo-data-contract";

export type DemoScenarioRequirementSet = {
  /** Missing any of these → FAIL for static plan audit */
  mustHave: DemoSeedRecordKind[];
  /** Missing any → WARN */
  shouldHave: DemoSeedRecordKind[];
};

/**
 * Static contract: each golden scenario plan must declare these record kinds in its `lines`.
 * Does not hit the database — validates marketing/seed documentation alignment only.
 */
export const DEMO_SCENARIO_REQUIREMENTS: Record<GoldenDemoScenarioId, DemoScenarioRequirementSet> = {
  "meal-prep-weekly": {
    mustHave: ["workspace_settings", "menu_products", "orders", "production"],
    shouldHave: ["packing", "routes", "blockers", "analytics_counters", "demo_notes"],
  },
  "cafe-pos": {
    mustHave: ["workspace_settings", "orders", "production"],
    shouldHave: ["activity", "crm"],
  },
  "bakery-preorder": {
    mustHave: ["menu_products", "orders", "production"],
    shouldHave: ["packing"],
  },
  "catering-event": {
    mustHave: ["orders", "production"],
    shouldHave: ["support_ticket", "packing"],
  },
  "ghost-channel": {
    mustHave: ["orders", "integration_health", "product_mapping"],
    shouldHave: ["blockers"],
  },
  "multi-brand-commissary": {
    mustHave: ["brands_locations", "orders", "production"],
    shouldHave: ["packing", "routes"],
  },
};
