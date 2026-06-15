import type { DemoVerticalSlug } from "@/lib/demo-verticals";

export type GoldenDemoScenarioId =
  | "meal-prep-weekly"
  | "cafe-pos"
  | "bakery-preorder"
  | "catering-event"
  | "ghost-channel"
  | "multi-brand-commissary";

export type DemoSeedRecordKind =
  | "workspace_settings"
  | "brands_locations"
  | "customers"
  | "menu_products"
  | "orders"
  | "blockers"
  | "production"
  | "packing"
  | "routes"
  | "activity"
  | "support_ticket"
  | "integration_health"
  | "product_mapping"
  | "crm"
  | "analytics_counters"
  | "demo_notes";

export type DemoSeedPlanLine = {
  kind: DemoSeedRecordKind;
  title: string;
  detail: string;
};

export type DemoSeedPlan = {
  scenarioId: GoldenDemoScenarioId;
  title: string;
  vertical: DemoVerticalSlug;
  lines: DemoSeedPlanLine[];
  safetyNotes: string[];
};
