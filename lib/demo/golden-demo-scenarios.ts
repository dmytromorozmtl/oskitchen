import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import type { DemoSeedPlan, GoldenDemoScenarioId } from "@/lib/demo/demo-data-contract";

const BASE_SAFETY = [
  "Seeding replaces demo operational data for this workspace using the existing demo import engine.",
  "Production hosts require DEMO_MODE_ENABLED for supervised demo imports.",
  "No live marketplace credentials or payment capture are created.",
] as const;

function plan(
  id: GoldenDemoScenarioId,
  title: string,
  vertical: DemoVerticalSlug,
  lines: DemoSeedPlan["lines"],
  extraSafety: string[] = [],
): DemoSeedPlan {
  return { scenarioId: id, title, vertical, lines, safetyNotes: [...BASE_SAFETY, ...extraSafety] };
}

export const GOLDEN_DEMO_SCENARIOS: DemoSeedPlan[] = [
  plan("meal-prep-weekly", "Meal prep weekly operations", "meal-prep", [
    { kind: "workspace_settings", title: "Workspace mode", detail: "Meal prep preset with weekly menus and demo flag on." },
    { kind: "menu_products", title: "Weekly menu + SKUs", detail: "Two menu windows with portioned mains and sides." },
    { kind: "orders", title: "Preorder + route orders", detail: "Realistic totals with pickup and delivery mix." },
    { kind: "production", title: "Production workload", detail: "Kitchen work items sized for batch prep narrative." },
    { kind: "packing", title: "Packing labels", detail: "Packing tasks when the vertical expects outbound bags." },
    { kind: "routes", title: "Delivery route sample", detail: "Stops only when delivery paths exist in the fixture." },
    { kind: "blockers", title: "Intentional triage", detail: "May include mapping or fulfillment gaps for QA walkthroughs." },
    { kind: "analytics_counters", title: "Analytics counters", detail: "Order volume surfaces on Today after refresh." },
    { kind: "demo_notes", title: "Walkthrough metadata", detail: "Scenario id recorded in audit trail when seeding runs." },
  ], [
    "Ingredient demand and AvT HIGH confidence still require real receiving and recipes beyond the fixture.",
  ]),
  plan("cafe-pos", "Cafe POS counter sale", "cafe", [
    { kind: "workspace_settings", title: "Cafe preset", detail: "POS-forward defaults with demo mode enabled." },
    { kind: "orders", title: "POS and ready-now mix", detail: "Counter-oriented orders with guest-friendly rows." },
    { kind: "production", title: "Kitchen routing", detail: "Made-to-order vs ready-made split where titles allow." },
    { kind: "activity", title: "Activity timeline", detail: "Checkout audit events flow through existing POS paths." },
    { kind: "crm", title: "Guest CRM posture", detail: "Guest checkout stays unlinked until staff attach a profile." },
  ]),
  plan("bakery-preorder", "Bakery preorder pickup", "bakery", [
    { kind: "menu_products", title: "Bakery SKUs", detail: "Pastry-focused titles with preorder-friendly metadata." },
    { kind: "orders", title: "Pickup windows", detail: "Pickup dates follow fulfillment rules." },
    { kind: "production", title: "Batch production", detail: "Work items align to bake batches in the demo preset." },
    { kind: "packing", title: "Labels", detail: "Packing tasks appear when the preset generates outbound work." },
  ]),
  plan("catering-event", "Catering event", "catering", [
    { kind: "orders", title: "Event orders", detail: "Catering preset orders sized for loadout storytelling." },
    { kind: "production", title: "Loadout production", detail: "Production batches sized for event portions." },
    { kind: "packing", title: "Loadout packing", detail: "Packing tasks when outbound handoff is modeled in the preset." },
    { kind: "support_ticket", title: "Support correlation", detail: "Optional manual ticket linkage; no fake desk." },
  ]),
  plan("ghost-channel", "Ghost kitchen channel operations", "ghost-kitchen", [
    { kind: "integration_health", title: "Channel posture", detail: "Rows stay simulated unless real keys exist." },
    { kind: "product_mapping", title: "Unmapped SKU story", detail: "References product mapping; conflicts only after imports." },
    { kind: "orders", title: "Commerce-shaped payloads", detail: "Demo orders follow import architecture without live API calls." },
    { kind: "blockers", title: "Mapping blocker", detail: "Resolve via import center; no auto-heal." },
  ]),
  plan(
    "multi-brand-commissary",
    "Multi-brand / commissary",
    "ghost-kitchen",
    [
      { kind: "brands_locations", title: "Two-brand workload", detail: "Ghost-kitchen preset with multi-brand narrative." },
      { kind: "orders", title: "Brand-mixed orders", detail: "Orders tagged for filter drills in production views." },
      { kind: "production", title: "Production by brand", detail: "Work items inherit menu mix for brand filters." },
      { kind: "packing", title: "Brand-separated bags", detail: "When the preset emits packing tasks for handoff." },
      { kind: "routes", title: "Dispatch sample", detail: "When the vertical preset models a delivery path." },
    ],
    ["Commissary label is UX-only; Prisma enum persists as cloud kitchen compatible presets."],
  ),
];

export function getGoldenDemoScenario(id: string): DemoSeedPlan | null {
  return GOLDEN_DEMO_SCENARIOS.find((s) => s.scenarioId === id) ?? null;
}

export function listGoldenDemoScenarioIds(): GoldenDemoScenarioId[] {
  return GOLDEN_DEMO_SCENARIOS.map((s) => s.scenarioId);
}
